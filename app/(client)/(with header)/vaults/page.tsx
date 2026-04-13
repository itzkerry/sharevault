"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VaultCard from "@/components/VaultCard";
import VaultCardSkeleton from "@/components/VaultCardSkeleton";
import { apiClient } from "@/lib/api-client";
import { FetchVaultsResponse } from "@/types/api";
import { VaultWithRelations } from "@/types/vault";
import { Check, FolderClosedIcon, Plus } from "lucide-react";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type FilterType = "allVault" | "shared" | "private";

export default function VaultsPage() {
  const [vaults, setVaults] = useState<FetchVaultsResponse["vaults"]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("allVault");
  useEffect(() => {
    const getVaults = async () => {
      setLoading(true);
      try {
        const data = await apiClient.fetchVaults();
        setVaults(data.vaults);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Unable to fetch vaults"
        );
      } finally {
        setLoading(false);
      }
    };
    getVaults();
  }, []);

  const [showNewVaultDialog, setShowNewVaultDialog] = useState(false);
  const [newVaultName, setNewVaultName] = useState("");
  const [creatingVault, setCreatingVault] = useState(false);
  const filterVaults = vaults.filter((vault) => {
    if (filter === "allVault") return true;
    if (filter === "shared") return vault.slug;
    if (filter === "private") return vault.slug == null;
    return true;
  });

  const handleCreateVault = async () => {
    setCreatingVault(true);
    try {
      const response = await apiClient.createVault(newVaultName);
      toast.success("Vault created");
      const newVault: VaultWithRelations = {
        ...response.vault,
        media: [], // New vaults start empty
        _count: { media: 0 },
      };
      setVaults((prev) => [newVault, ...prev]);
      setShowNewVaultDialog(false);
      setNewVaultName("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create vault"
      );
    } finally {
      setCreatingVault(false);
    }
  };
  const handleRemoveVault = (id: string) => {
    setVaults((currVaults) => currVaults.filter((v) => v.id !== id));
  };
  return (
    <div className="mx-auto max-w-7xl px-5 py-5">
      {/* Heading  */}
      <div className="bg-background mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            My Vaults
          </h1>
          <p className="text-muted-foreground text-xs font-semibold">
            {vaults.length} vaults
          </p>
        </div>
        <Button
          onClick={() => setShowNewVaultDialog(true)}
          className="cursor-pointer rounded-[10px] px-6 py-3 text-xs font-semibold tracking-tight"
        >
          <Plus className="h-3 w-3" />
          New Vault
        </Button>
      </div>

      {/* Filter Tabs  */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setFilter("allVault")}
          variant={filter === "allVault" ? "ghost" : "outline"}
          className="bg-card cursor-pointer rounded-[10px]"
        >
          {filter === "allVault" && (
            <Check className="h-4 w-4 text-indigo-600" />
          )}{" "}
          All Vaults
        </Button>
        <Button
          onClick={() => setFilter("shared")}
          variant={filter === "shared" ? "ghost" : "outline"}
          className="bg-card cursor-pointer rounded-[10px]"
        >
          {filter === "shared" && <Check className="h-4 w-4 text-indigo-600" />}
          Shared
        </Button>
        <Button
          onClick={() => setFilter("private")}
          variant={filter === "private" ? "ghost" : "outline"}
          className="bg-card cursor-pointer rounded-[10px]"
        >
          {filter === "private" && (
            <Check className="h-4 w-4 text-indigo-600" />
          )}
          Private
        </Button>
      </div>

      {/* grid of Vaults  */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <VaultCardSkeleton key={i} />)
        ) : filterVaults.length > 0 ? (
          filterVaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onDelete={handleRemoveVault}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
            No {filter !== "allVault" && filter} vaults found.
          </div>
        )}
      </div>

      <AlertDialog
        open={showNewVaultDialog}
        onOpenChange={setShowNewVaultDialog}
      >
        <AlertDialogContent size="sm" className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-primary/10 text-primary rounded-[10px]">
              <FolderClosedIcon />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-semibold">
              Create Vault
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="py-2">
            <p className="text-muted-foreground mb-1 text-sm">
              Enter vault name :{" "}
            </p>
            <Input
              className="rounded-[10px]"
              placeholder="My vault"
              onChange={(e) => setNewVaultName(e.target.value)}
              value={newVaultName}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-[10px]"
              disabled={creatingVault}
              onClick={() => setNewVaultName("")}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={newVaultName.trim().length === 0 || creatingVault}
              className="rounded-[10px]"
              onClick={(e) => {
                e.preventDefault();
                handleCreateVault();
              }}
            >
              {creatingVault ? "creating..." : "Create"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
