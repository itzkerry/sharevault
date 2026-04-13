"use client";
import { apiClient } from "@/lib/api-client";
import { formatDuration, formatFileSize } from "@/lib/utils";
import { Media } from "@/types/vault";
import {
  Download,
  ImageIcon,
  Link2,
  Loader2,
  PlayCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

const MediaCard = ({
  media,
  onClick,
  onDelete,
  isReadOnly = false,
}: {
  media: Media;
  onClick: () => void;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}) => {
  // handle delete
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.deleteMedia([media.id]);
      onDelete?.(media.id);
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

  // copy button
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(media.url);
    toast.success("Link copied!");
  };
  const isVideo = media.type === "VIDEO";
  const previewSrc =
    media.thumbnailUrl && !media.thumbnailUrl.includes("ik-thumbnail")
      ? media.thumbnailUrl
      : !isVideo
        ? media.url
        : null;
  return (
    <div className="border-border overflow-hidden rounded-sm border tracking-tight">
      {/* media  */}

      <div onClick={onClick} className="relative block aspect-16/10">
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt={media.name}
            fill
            loading="eager"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          // fallback for videos with no thumbnail
          <div className="bg-muted text-muted-foreground/10 flex h-full w-full items-center justify-center text-2xl font-extrabold tracking-wider">
            NO IMAGE
          </div>
        )}
        <div className="absolute top-1 right-1 z-10 flex items-center justify-center rounded-full bg-black/40 px-2 py-1">
          {isVideo ? (
            <span className="font-secondary flex items-center justify-center gap-1 text-[10px] font-normal text-white">
              <PlayCircle size={12} className="pb-px" />
              <p>{formatDuration(media.duration ?? 0)}</p>
            </span>
          ) : (
            <ImageIcon size={10} className="text-white" />
          )}
        </div>

        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
      </div>
      <div className="font-secondary flex flex-col gap-1 border-t bg-white px-4 py-4">
        <div className="truncate text-sm leading-3 font-medium">
          {media.name}
        </div>
        <div className="text-muted-foreground flex items-center justify-between gap-1 text-[10px]">
          <span>{formatFileSize(media.size)}</span>
          <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
            <Link2
              onClick={handleCopyLink}
              className="text-primary h-3 w-3 cursor-pointer"
            />
            <Download
              onClick={() => handleDownload(media.url, media.name)}
              className="text-foreground h-3 w-3 cursor-pointer"
            />
            {!isReadOnly && (
              <button onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="text-destructive h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="text-destructive h-3 w-3 cursor-pointer" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
