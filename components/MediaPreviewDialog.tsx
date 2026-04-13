"use client";

import { Media } from "@/types/vault";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dot,
  Download,
  Link2,
  Loader2,
  Play,
  Trash2Icon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { Button } from "./ui/button";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

const MediaPreviewDialog = ({
  media,
  initialIndex,
  open,
  onClose,
  onDelete,
  isReadOnly = false,
}: {
  media: Media[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const current = media[currentIndex];
  const isVideo = current?.type === "VIDEO";

  // handle delete
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.deleteMedia([current.id]);
      onDelete?.(current.id);
    } catch {
      toast.error("Media not deleted");
    } finally {
      setDeleting(false);
    }
  };

  // handle download
  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to download file");
    }
  };

  // copy link
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(current.url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Copying link failed");
    }
  };

  // sync index when dialog opens on a different item
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // scroll thumbnail into view when index changes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, open]);

  const prev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  const next = () => setCurrentIndex((i) => (i < media.length - 1 ? i + 1 : i));

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        size="full"
        className="flex h-screen w-full flex-col gap-0 rounded-none border-none bg-transparent p-0 backdrop-blur-md"
      >
        <DialogHeader className="bg-muted flex flex-row items-center justify-between gap-1 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="text-foreground font-secondary truncate text-sm font-medium">
              {current.name}
            </div>
            <div className="text-muted-foreground font-secondary flex items-center text-[10px] font-medium">
              {currentIndex + 1} of {media.length}
              <Dot size={15} />
              {formatFileSize(current.size)}
            </div>
          </div>
          <DialogClose>
            <X size={20} />
          </DialogClose>
        </DialogHeader>

        {/* main preview */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-5">
          {currentIndex > 0 && (
            <button
              onClick={prev}
              className="text-muted-foreground absolute left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {isVideo ? (
            <video
              key={current.id}
              src={current.url}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="relative h-full w-full">
              <Image
                key={current.id}
                src={current.url}
                alt={current.name}
                fill
                className="rounded-lg object-contain"
                sizes="100vw"
              />
            </div>
          )}

          {currentIndex < media.length - 1 && (
            <button
              onClick={next}
              className="text-muted-foreground absolute right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* footer  */}
        <div className="bg-muted flex flex-col gap-5 overflow-hidden px-5 py-5">
          {/* thumbnail strip */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1">
            <div className="mx-auto flex min-w-max gap-2">
              {media.map((item, i) => {
                const isVideoItem = item.type === "VIDEO";
                const validThumb = item.thumbnailUrl?.includes("ik-thumbnail")
                  ? null
                  : item.thumbnailUrl;
                const thumbSrc = isVideoItem ? validThumb : item.url;
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      thumbnailRefs.current[i] = el;
                    }}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-[5px] ring-offset-1 transition-all ${
                      i === currentIndex
                        ? "ring-primary opacity-100 ring-2 ring-offset-white"
                        : "opacity-70 ring-1 ring-black/10 hover:opacity-80"
                    }`}
                  >
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="bg-muted-foreground flex h-full w-full items-center justify-center"></div>
                    )}
                    {isVideoItem && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={10} className="fill-white text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex flex-row items-center justify-between">
            <div className="text-muted-foreground font-secondary flex flex-col font-medium">
              <div className="text-sm">Uploaded : </div>
              <div className="px-1 text-[10px]">
                {" "}
                {formatDate(current.createdAt)}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                onClick={copyLink}
                className="text-foreground bg-muted-foreground/10 rounded-[10px]"
              >
                {copied ? (
                  <Check className="text-green-500" />
                ) : (
                  <Link2 size={10} />
                )}
              </Button>
              {!isReadOnly && (
                <Button
                  onClick={handleDelete}
                  className="text-destructive bg-destructive/10 rounded-[10px]"
                >
                  {deleting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash2Icon size={10} />
                  )}
                </Button>
              )}
              <Button
                onClick={() => handleDownload(current.url, current.name)}
                className="rounded-[10px] px-5 text-xs font-semibold"
              >
                <Download />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreviewDialog;
