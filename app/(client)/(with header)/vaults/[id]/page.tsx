"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { Vault } from "@/types/vault";
import {
  Check,
  ChevronRight,
  CloudUpload,
  Copy,
  Globe2,
  Loader2,
  LockKeyhole,
  Plus,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import VaultCardSkeleton from "@/components/VaultCardSkeleton";
import MediaCard from "@/components/MediaCard";
import MediaPreviewDialog from "@/components/MediaPreviewDialog";

export default function SingleVaultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getVault = async () => {
      setLoading(true);
      const { id } = await params;
      try {
        const data = await apiClient.fetchVault(id);
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

  // share drop down tools
  const [menuOpen, setMenuOpen] = useState(false);

  // generate link
  const [generatingShareLink, setGeneratingShareLink] = useState(false);
  const generateLink = async () => {
    setGeneratingShareLink(true);
    if (!vault) return;
    try {
      const data = await apiClient.shareVault(vault.id);
      vault.slug = data.vault.slug;
      toast.success(`Public link generated for "${vault?.name}" vault.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch vaults"
      );
    } finally {
      setGeneratingShareLink(false);
    }
  };

  // distroy link
  const [destroyingShareLink, setDestroyingShareLink] = useState(false);
  const destroyLink = async () => {
    setDestroyingShareLink(true);
    if (!vault) return;
    try {
      await apiClient.unshareVault(vault.id);
      vault.slug = null;
      toast.success(`Public link destroyed for "${vault.name}" vault.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch vaults"
      );
    } finally {
      setDestroyingShareLink(false);
    }
  };

  // copy link
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    if (!vault) return;
    if (vault.slug) {
      const shareUrl = `${window.location.origin}/share/${vault.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Vault is not shared yet");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<{
    total: number;
    done: number;
    failed: number;
    uploading: boolean;
  }>({ total: 0, done: 0, failed: 0, uploading: false });

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploadState({ total: arr.length, done: 0, failed: 0, uploading: true });

    await Promise.all(
      arr.map(async (file) => {
        try {
          // fetch auth per file
          const auth = await apiClient.getImageKitAuth();
          // uplaod to image kit
          const formData = new FormData();
          formData.append("file", file);
          formData.append("fileName", file.name);
          formData.append("publicKey", auth.publicKey);
          formData.append("signature", auth.signature);
          formData.append("expire", String(auth.expire));
          formData.append("token", auth.token);

          const ikResponse = await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            { method: "POST", body: formData }
          );

          if (!ikResponse.ok) throw new Error("ImageKit upload failed");

          const ikData = await ikResponse.json();
          // determine type
          const isVideo = file.type.startsWith("video/");

          const thumbnailUrl = isVideo
            ? `${ikData.url}/ik-thumbnail.jpg`
            : (ikData.thumbnailUrl ?? undefined);

          //save the metadata to backend
          await apiClient.createMedia({
            name: ikData.name,
            fileId: ikData.fileId,
            url: ikData.url,
            thumbnailUrl,
            type: isVideo ? "VIDEO" : "IMAGE",
            size: ikData.size,
            width: ikData.width ?? undefined,
            height: ikData.height ?? undefined,
            duration: isVideo ? (ikData.duration ?? undefined) : undefined,
            vaultId: vault!.id,
          });
          setUploadState((prev) => ({ ...prev, done: prev.done + 1 }));
        } catch (error) {
          setUploadState((prev) => ({ ...prev, failed: prev.failed + 1 }));
          toast.error(error instanceof Error ? error.message : "Upload failed");
        }
      })
    );
    setTimeout(() => {
      setUploadState((prev) => ({ ...prev, uploading: false }));
    }, 1000);
    const data = await apiClient.fetchVault(vault!.id);
    setVault(data.vault);
  };
  // button click → trigger input
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };
  // dropzone events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const addFilesButtonRef = useRef<HTMLButtonElement>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingButton(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (addFilesButtonRef.current) {
      observer.observe(addFilesButtonRef.current);
    }
    return () => observer.disconnect();
  }, [vault]);

  const handleRemoveMedia = (id: string) => {
    setVault((currVault) =>
      currVault
        ? { ...currVault, media: currVault.media?.filter((v) => v.id !== id) }
        : currVault
    );
  };
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  return (
    <div className="mx-auto max-w-7xl px-5 py-5 font-sans">
      {/* header  */}
      <div className="mb-4 flex flex-col items-start justify-center">
        <div className="flex items-center justify-start gap-1 text-[10px] font-semibold tracking-wide">
          <Link href={"/vaults"} className="text-muted-foreground">
            My Vaults
          </Link>
          <ChevronRight size={12} className="" />
          <p className="text-primary">{vault?.name ?? "vault"}</p>
        </div>

        <div className="flex w-full items-center justify-between">
          <h1 className="text-foreground font-sans text-2xl font-semibold tracking-tight">
            {vault?.name}
          </h1>
          {vault?.slug ? (
            <span className="flex items-center gap-1 rounded-[5px] border border-green-500 bg-green-50/90 px-2 text-[10px] tracking-wide text-[#10b981] backdrop-blur-2xl">
              <Globe2 size={10} />
              Shared
            </span>
          ) : (
            <span className="text-destructive flex items-center gap-1 rounded-[5px] border border-red-500 bg-red-50/90 px-2 text-[10px] tracking-wide backdrop-blur-2xl">
              <LockKeyhole size={10} />
              Private
            </span>
          )}
        </div>
      </div>

      {/* buttons  */}
      <div className="mb-5 flex w-full gap-3">
        <button
          onClick={handleButtonClick}
          ref={addFilesButtonRef}
          className="bg-primary flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-xs font-medium text-white"
        >
          <Plus size={10} />
          Add Files
        </button>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger className="bg-muted border-border flex w-full flex-1 items-center justify-center gap-2 rounded-[10px] border px-4 py-2 text-xs font-medium">
            <Share2 size={10} />
            Share Vault
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-fit rounded-[10px]"
          >
            {vault?.slug ? (
              <>
                <DropdownMenuItem className="group cursor-pointer rounded-[10px]">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyLink();
                    }}
                    className="flex w-full items-center"
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy Link
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-[10px]">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      destroyLink();
                    }}
                    className={`flex w-full ${generatingShareLink ? "cursor-not-allowed opacity-50" : ""} `}
                  >
                    {destroyingShareLink ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Deleting...
                      </span>
                    ) : (
                      <div className="flex">
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        Make Private
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="cursor-pointer rounded-[10px]">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    generateLink();
                  }}
                  className={`flex w-full ${generatingShareLink ? "cursor-not-allowed opacity-50" : ""} `}
                >
                  {generatingShareLink ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Sharing...
                    </span>
                  ) : (
                    <div className="flex">
                      <Globe2 className="mr-2 h-4 w-4" />
                      Share Vault
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* drop box */}
      <div
        onClick={handleButtonClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mb-6 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-7"
      >
        <CloudUpload size={24} className="text-primary" />
        <p className="font-sans text-xs tracking-wider">
          Drop files here or click to upload
        </p>
        <p className="text-muted-foreground font-sans text-[10px] tracking-wider">
          Supports JPG, PNG, MP4 (Max 50MB)
        </p>
      </div>

      {/* file count and size */}
      <div className="mb-6 flex flex-col justify-center">
        <div className="flex flex-col items-start justify-between">
          <p className="text-foreground text-sm font-semibold">Files</p>
          <span className="text-muted-foreground flex gap-1 text-xs">
            {`${vault?.media?.length ?? 0} items`}.{}
          </span>
        </div>
      </div>

      {/* hidden input element  */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleInputChange}
      />
      <Button
        onClick={handleButtonClick}
        className={`bg-primary fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-[10px] px-4 py-3 text-xs font-medium text-white shadow-lg transition-all duration-200 ${
          showFloatingButton
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-4 opacity-0"
        }`}
      >
        <Plus size={10} />
        Add Files
      </Button>

      {/* all medias  */}
      <div className="relative">
        {uploadState.uploading && (
          <div className="bg-background sticky top-18 z-10 mb-4 rounded-[10px] border p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Uploading {uploadState.done + uploadState.failed} of{" "}
                {uploadState.total}
              </span>
              {uploadState.failed > 0 && (
                <span className="text-destructive">
                  {uploadState.failed} failed
                </span>
              )}
            </div>
            <div className="bg-muted h-1.5 w-full rounded-full">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((uploadState.done + uploadState.failed) / uploadState.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* all media grid  */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <VaultCardSkeleton key={i} />
            ))
          ) : vault?.media && vault?.media?.length > 0 ? (
            vault?.media?.map((media, i) => (
              <MediaCard
                key={media.id}
                media={media}
                onClick={() => setPreviewIndex(i)}
                onDelete={handleRemoveMedia}
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
          onDelete={handleRemoveMedia}
        />
      </div>
    </div>
  );
}
