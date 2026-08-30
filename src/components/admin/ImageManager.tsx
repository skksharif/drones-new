"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { createUploadTicketAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

/**
 * The product's images, as an ordered list whose first entry is the primary.
 *
 * It posts two hidden fields — `image` and `gallery` — so the server keeps the
 * exact shape it already had: a primary image plus extra gallery paths. Files
 * go straight from the browser to Cloudinary using a signed ticket, so nothing
 * large passes through a server action.
 */

interface UploadTicket {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

async function uploadOne(file: File, ticket: UploadTicket): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", ticket.apiKey);
  body.append("timestamp", String(ticket.timestamp));
  body.append("folder", ticket.folder);
  body.append("signature", ticket.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${ticket.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const json = await response.json();
  if (!response.ok || !json.secure_url) {
    throw new Error(json?.error?.message ?? "Cloudinary rejected the upload.");
  }
  return json.secure_url as string;
}

export function ImageManager({
  initialImage,
  initialGallery,
  uploadsEnabled,
  hint = "Drag order sets the gallery order; the first image is used everywhere.",
}: {
  initialImage: string;
  initialGallery: string[];
  uploadsEnabled: boolean;
  /** Overridden by the banner form, which only ever uses one image. */
  hint?: string;
}) {
  // The primary image is simply the first entry — one list is far easier to
  // reason about than a primary plus a separate gallery.
  const [images, setImages] = useState<string[]>([initialImage, ...initialGallery].filter(Boolean));
  const [error, setError] = useState<string | null>(null);
  const [busy, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState("");

  function add(urls: string[]) {
    setImages((current) => {
      const seen = new Set(current);
      return [...current, ...urls.filter((url) => url && !seen.has(url))];
    });
  }

  function move(index: number, delta: number) {
    setImages((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    startUpload(async () => {
      try {
        const chosen = Array.from(files);
        // One ticket per file: a Cloudinary signature covers a single upload.
        const urls: string[] = [];
        for (const file of chosen) {
          const result = await createUploadTicketAction();
          if (!result.ok) throw new Error(result.message);
          urls.push(await uploadOne(file, result.ticket));
        }
        add(urls);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Upload failed.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="image" value={images[0] ?? ""} />
      <input type="hidden" name="gallery" value={images.slice(1).join("\n")} />

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          No images yet. The first one you add becomes the card and hero image.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <li
              key={src}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-white",
                index === 0 ? "border-brand-700/40 ring-2 ring-brand-700/15" : "border-ink-200",
              )}
            >
              <div className="relative aspect-square bg-ink-50">
                <Image src={src} alt="" fill sizes="200px" className="object-contain p-2" />
              </div>

              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-700 px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                  Primary
                </span>
              ) : null}

              <div className="flex items-center justify-between gap-1 border-t border-ink-100 p-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Move earlier"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded-md px-1.5 py-0.5 text-xs text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Move later"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded-md px-1.5 py-0.5 text-xs text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  className="rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-500 hover:bg-brand-50 hover:text-brand-800"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p role="alert" className="text-sm font-medium text-brand-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          disabled={!uploadsEnabled || busy}
          onChange={(event) => onFiles(event.target.files)}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          aria-disabled={!uploadsEnabled || busy}
          className={cn(
            "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors",
            uploadsEnabled && !busy
              ? "bg-ink-900 text-white hover:bg-ink-800"
              : "cursor-not-allowed bg-ink-100 text-ink-400",
          )}
        >
          {busy ? "Uploading…" : "Upload images"}
        </label>

        <span className="text-xs text-ink-500">
          {uploadsEnabled
            ? hint
            : "Cloudinary is not configured — paste an existing path below instead."}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            // Enter here would otherwise submit the whole product form.
            event.preventDefault();
            add([manual.trim()]);
            setManual("");
          }}
          placeholder="https://res.cloudinary.com/…/image.jpg"
          className="h-10 flex-1 rounded-xl border border-ink-200 px-3.5 font-mono text-xs outline-none focus:border-brand-700/50"
        />
        <button
          type="button"
          onClick={() => {
            add([manual.trim()]);
            setManual("");
          }}
          className="h-10 rounded-xl border border-ink-200 px-3.5 text-sm font-medium text-ink-600 hover:border-brand-700/40 hover:text-brand-800"
        >
          Add path
        </button>
      </div>
    </div>
  );
}
