"use client";
import MediaCard from "@/components/MediaCard";
import MediaPreviewDialog from "@/components/MediaPreviewDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VaultCardSkeleton from "@/components/VaultCardSkeleton";
import { apiClient } from "@/lib/api-client";
import { SharedVault } from "@/types/vault";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [vault, setVault] = useState<SharedVault | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getVault = async () => {
      setLoading(true);
      const { id } = await params;
      try {
        const data = await apiClient.fetchSharedVault(id);
        setVault(data.vault);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Unable to fetch vault"
        );
      } finally {
        setLoading(false);
      }
    };
    getVault();
  }, [params]);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-5 py-5 font-sans">
      <div className="mb-6 flex items-center gap-3 rounded-xl border px-4 py-3">
        <Avatar className="cursor-pointer">
          <AvatarImage src={vault?.user?.image ?? ""} />
          <AvatarFallback>{vault?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col">
          <p className="text-sm font-medium">Shared by {vault?.user?.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            {vault?.user?.email}
          </p>
        </div>
      </div>

      {/* file count and size */}
      <div className="mb-6 flex flex-col justify-center">
        <div className="flex flex-col items-start justify-between">
          <p className="text-foreground text-sm font-semibold">Shared Files</p>
          <span className="text-muted-foreground flex gap-1 text-xs">
            {`${vault?.media?.length ?? 0} items`}.{}
          </span>
        </div>
      </div>

      {/* all media grid  */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <VaultCardSkeleton key={i} />)
        ) : vault?.media && vault?.media?.length > 0 ? (
          vault?.media?.map((media, i) => (
            <MediaCard
              key={media.id}
              media={media}
              onClick={() => setPreviewIndex(i)}
              isReadOnly
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
            No media found.
          </div>
        )}
      </div>

      <MediaPreviewDialog
        media={vault?.media ?? []}
        initialIndex={previewIndex ?? 0}
        open={previewIndex !== null}
        onClose={() => setPreviewIndex(null)}
        isReadOnly
      />
    </div>
  );
}
