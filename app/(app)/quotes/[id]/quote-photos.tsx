"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteQuotePhoto,
  uploadQuotePhoto,
} from "@/app/(app)/quotes/photo-actions";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import type { QuoteAttachment } from "@/db/schema";
import { MAX_QUOTE_PHOTOS } from "@/lib/constants";

export function QuotePhotos({
  quoteId,
  attachments,
}: {
  quoteId: string;
  attachments: QuoteAttachment[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUploading] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, startRemoving] = useTransition();

  const isFull = attachments.length >= MAX_QUOTE_PHOTOS;

  function handleFile(file: File) {
    const formData = new FormData();
    formData.set("quoteId", quoteId);
    formData.set("photo", file);

    startUploading(async () => {
      const { error } = await uploadQuotePhoto(formData);
      if (error) toast.error(error);
      else toast.success("Photo added.");
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">Photos</h2>

      {attachments.length === 0 ? (
        <Panel className="text-sm text-ink-60">
          No photos yet. Pictures of the job help a homeowner trust the price.
        </Panel>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="relative">
              <Image
                src={attachment.url}
                alt={attachment.caption ?? "Job photo"}
                width={200}
                height={200}
                unoptimized
                className="aspect-square w-full rounded-md border border-hairline bg-surface object-cover"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove photo"
                className="absolute top-1 right-1 bg-surface/90 backdrop-blur"
                loading={removingId === attachment.id}
                onClick={() => {
                  setRemovingId(attachment.id);
                  startRemoving(async () => {
                    const { error } = await deleteQuotePhoto(
                      quoteId,
                      attachment.id,
                    );
                    if (error) toast.error(error);
                    setRemovingId(null);
                  });
                }}
              >
                {removingId === attachment.id ? null : (
                  <Trash2 className="text-destructive" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <Button
        variant="ghost"
        size="lg"
        className="w-full sm:w-auto"
        loading={isUploading}
        disabled={isFull}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? null : <ImagePlus />}
        {isUploading
          ? "Uploading…"
          : isFull
            ? `Limit of ${MAX_QUOTE_PHOTOS} reached`
            : "Add photo"}
      </Button>
    </section>
  );
}
