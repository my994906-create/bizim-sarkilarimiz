import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createTrack, listTracks, removeTrack } from "./db";
import { assertAudioUpload, assertCoverUpload, cleanTrackTitle, safeAudioFilename, safeCoverFilename } from "./musicValidation";
import { storagePut } from "./storage";

const categorySchema = z.enum(["sakin", "enerji", "gece", "yol", "diger"]);
const coverSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  base64: z.string().min(1),
});

function absoluteUrl(relativeUrl: string, protocol: string, host: string | undefined) {
  return new URL(relativeUrl, `${protocol}://${host || "localhost"}`).toString();
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
    list: publicProcedure.query(async () => listTracks()),
    upload: adminProcedure
      .input(z.object({
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
      .mutation(async ({ ctx, input }) => {
        const bytes = Buffer.from(input.base64, "base64");
        try {
          assertAudioUpload({ mimeType: input.mimeType, byteLength: bytes.byteLength });
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Ses dosyası geçersiz." });
        }

        const fileName = safeAudioFilename(input.filename);
        const { key, url } = await storagePut(`music/${ctx.user.id}/${Date.now()}-${fileName}`, bytes, input.mimeType);
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
          const storedCover = await storagePut(`covers/${ctx.user.id}/${Date.now()}-${coverName}`, coverBytes, input.cover.mimeType);
          coverStorageKey = storedCover.key;
          coverUrl = absoluteUrl(storedCover.url, ctx.req.protocol, ctx.req.get("host"));
        }

        const publicAudioUrl = absoluteUrl(url, ctx.req.protocol, ctx.req.get("host"));
        const title = cleanTrackTitle(input.title || input.filename);
        const artist = cleanTrackTitle(input.artist || "Bizim Şarkılarımız");
        const genre = (input.genre || "").trim().slice(0, 120);
        const lyrics = (input.lyrics || "").trim().slice(0, 20_000);

        await createTrack({
          title,
          artist,
          category: input.category,
          storageKey: key,
          audioUrl: publicAudioUrl,
          coverStorageKey,
          coverUrl,
          genre,
          lyrics,
          published: input.published,
          durationSeconds: input.durationSeconds,
          fileSizeBytes: bytes.byteLength,
          uploadedByUserId: ctx.user.id,
        });
        return {
          success: true,
          track: { title, artist, category: input.category, genre, lyrics, published: input.published, audioUrl: publicAudioUrl, coverUrl, durationSeconds: input.durationSeconds },
        } as const;
      }),
    remove: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await removeTrack(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
