"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, Trash2, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

const Header = () => {
  const { data: session } = useSession();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.deleteUser();
      toast.success("Account deleted successfully");
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      setIsDeleting(false);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };
  return (
    <header className="bg-background/95 sticky top-0 z-50 flex w-full items-center justify-between border-b px-4 py-3 backdrop:blur sm:px-6">
      <Link href="/vaults" className="flex items-center gap-0.5">
        <Logo className="text-primary h-10 w-10" />
        <span className="text-foreground text-base font-semibold tracking-tight sm:text-lg">
          ShareVault
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer">
            <AvatarImage src={session?.user?.image ?? ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="flex w-48 flex-col gap-1 rounded-[10px]"
        >
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium">
              {session?.user?.name}
            </p>
            <p className="truncate text-xs text-gray-500">
              {session?.user?.email}
            </p>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowLogoutDialog(true);
            }}
            // onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex cursor-pointer items-center gap-2 rounded-[10px]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
            variant="destructive"
            className="flex cursor-pointer items-center gap-2 rounded-[10px] text-red-500 focus:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout AlertDialog  */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent size="sm" className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to log out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will need to log back in to access your media vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 rounded-[10px] text-white"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account AlertDialog  */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent size="sm" className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive rounded-[10px]">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-semibold">
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all your media.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <p className="text-muted-foreground mb-2 text-sm">
              Type <span className="text-destructive/90 font-bold">DELETE</span>{" "}
              to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="border-destructive focus-visible:ring-destructive rounded-[10px] focus:border-0"
              placeholder="DELETE"
            />
            <p className="text-muted-foreground mt-2 text-sm">
              This action is irreversible.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-[10px]"
              onClick={() => setConfirmText("")}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== "DELETE" || isDeleting}
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-[10px] text-white"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;
