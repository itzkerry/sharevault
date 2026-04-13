"use client";
import { VaultWithRelations } from "@/types/vault";
import {
  Check,
  Copy,
  Edit,
  FolderClosedIcon,
  Globe2,
  Loader2,
  LockKeyhole,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";
import Link from "next/link";

const VaultCard = ({
  vault,
  onDelete,
}: {
  vault: VaultWithRelations;
  onDelete: (id: string) => void;
}) => {
  // delete vault
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingVault, setDeletingVault] = useState(false);
  const handleDeleteVault = async () => {
    setDeletingVault(true);
    try {
      await apiClient.deleteVault(vault.id);
      setShowDeleteDialog(false);
      onDelete(vault.id);
      toast.success(`"${vault.name}" vault deleted`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch vaults"
      );
    } finally {
      setDeletingVault(false);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  // generate link
  const [generatingShareLink, setGeneratingShareLink] = useState(false);
  const generateLink = async () => {
    setGeneratingShareLink(true);
    try {
      const data = await apiClient.shareVault(vault.id);
      vault.slug = data.vault.slug;
      toast.success(`Public link generated for "${vault.name}" vault.`);
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

  const previewSrc = vault.media?.[0]?.thumbnailUrl || vault.media?.[0]?.url;
  return (
    <div className="border-border overflow-hidden rounded-sm border tracking-tight">
      <Link
        href={`/vaults/${vault.id}`}
        className="relative block aspect-16/10"
      >
        <div className="absolute top-1 right-1 z-10">
          {vault.slug ? (
            <span className="flex items-center gap-1 rounded-full border border-green-500 bg-green-50/90 px-2 text-[10px] tracking-wide text-[#10b981] backdrop-blur-2xl">
              <Globe2 size={10} />
              Shared
            </span>
          ) : (
            <span className="text-destructive flex items-center gap-1 rounded-full border border-red-500 bg-red-50/90 px-2 text-[10px] tracking-wide backdrop-blur-2xl">
              <LockKeyhole size={10} />
              Private
            </span>
          )}
        </div>
        {previewSrc ? (
          <Image
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            alt={vault.name}
            src={previewSrc}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="bg-primary/10 text-primary flex h-full w-full shrink-0 items-center justify-center">
            <FolderClosedIcon size={32} />
          </div>
        )}
      </Link>

      <div className="font-secondary flex flex-col gap-1 bg-white px-4 py-4">
        <div className="text-sm leading-3 font-semibold">{vault.name}</div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{vault._count?.media} items</span>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger>
              <MoreVertical className="h-4 w-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-fit rounded-[10px]"
            >
              {vault.slug ? (
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
                          <Loader2 className="h-3 w-3 animate-spin" />{" "}
                          Deleting...
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
              <DropdownMenuItem
                disabled
                className="cursor-pointer rounded-[10px]"
              >
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-[10px]"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* to make the remane dialog  */}
      {/* <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent size="sm" className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Generate public link</AlertDialogTitle>
            <AlertDialogDescription>
              It will generate link for &quot;{vault.name}&quot; vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={generatingShareLink}
              className="rounded-[10px]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={generatingShareLink}
              onClick={generateLink}
              className="rounded-[10px]"
            >
              {generatingShareLink ? "Generating..." : "Generate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* delete vault dailog  */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent size="sm" className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vault ?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{vault.name}&quot;
              {vault._count.media > 0
                ? ` and the ${vault._count.media} ${vault._count.media === 1 ? "item" : "items"} inside it.`
                : "and all its contents"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletingVault}
              className="rounded-[10px]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingVault}
              onClick={handleDeleteVault}
              className="rounded-[10px]"
            >
              {deletingVault ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VaultCard;
