import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { assertFirebaseArchiveOwner } from "./firebaseAuth";
import { assertAudioUpload, assertCoverUpload, cleanTrackTitle, safeAudioFilename, safeCoverFilename } from "./musicValidation";
import { storagePut } from "./storage";

const categorySchema = z.enum(["sakin", "enerji", "gece", "yol", "diger"]);
const coverSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  base64: z.string().min(1),
});

function absoluteUrl(relativeUrl: string, origin: string) {
  return new URL(relativeUrl, origin).toString();
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  music: router({
    upload: publicProcedure
      .input(z.object({
        firebaseIdToken: z.string().min(1),
        mediaOrigin: z.string().url().max(512),
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        base64: z.string().min(1),
        title: z.string().max(255).optional(),
        artist: z.string().max(255).optional(),
        category: categorySchema.default("diger"),
        genre: z.string().max(120).optional(),
        lyrics: z.string().max(20_000).optional(),
        cover: coverSchema.optional(),
        published: z.boolean().default(true),
        durationSeconds: z.number().int().min(0).max(86_400).default(0),
      }))
      .mutation(async ({ input }) => {
        await assertFirebaseArchiveOwner(input.firebaseIdToken);
        const bytes = Buffer.from(input.base64, "base64");
        try {
          assertAudioUpload({ mimeType: input.mimeType, byteLength: bytes.byteLength });
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Ses dosyası geçersiz." });
        }

        const fileName = safeAudioFilename(input.filename);
        const namespace = "music-archive";
        const { key, url } = await storagePut(`music/${namespace}/${Date.now()}-${fileName}`, bytes, input.mimeType);
        let coverStorageKey: string | null = null;
        let coverUrl: string | null = null;

        if (input.cover) {
          const coverBytes = Buffer.from(input.cover.base64, "base64");
          try {
            assertCoverUpload({ mimeType: input.cover.mimeType, byteLength: coverBytes.byteLength });
          } catch (error) {
            throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Kapak görseli geçersiz." });
          }
          const coverName = safeCoverFilename(input.cover.filename);
          const storedCover = await storagePut(`covers/${namespace}/${Date.now()}-${coverName}`, coverBytes, input.cover.mimeType);
          coverStorageKey = storedCover.key;
          coverUrl = absoluteUrl(storedCover.url, input.mediaOrigin);
        }

        const publicAudioUrl = absoluteUrl(url, input.mediaOrigin);
        const title = cleanTrackTitle(input.title || input.filename);
        const artist = cleanTrackTitle(input.artist || "Bizim Şarkılarımız");
        const genre = (input.genre || "").trim().slice(0, 120);
        const lyrics = (input.lyrics || "").trim().slice(0, 20_000);

        return {
          success: true,
          track: { title, artist, category: input.category, genre, lyrics, published: input.published, audioUrl: publicAudioUrl, audioStorageKey: key, coverUrl, coverStorageKey, durationSeconds: input.durationSeconds },
        } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
