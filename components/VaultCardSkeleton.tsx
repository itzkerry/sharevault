import { MoreVertical } from "lucide-react";

// VaultCardSkeleton.tsx
const VaultCardSkeleton = () => {
  return (
    <div className="border-border animate-pulse overflow-hidden rounded-sm border tracking-tight">
      {/* Image area */}
      <div className="bg-muted relative aspect-16/10">
        {/* Badge placeholder */}
        <div className="absolute top-1 right-1 z-10">
          <div className="bg-muted-foreground/10 h-4 w-13 rounded-full" />
        </div>
      </div>

      {/* Footer area */}
      <div className="font-secondary flex flex-col gap-2 px-4 py-4">
        {/* Vault name */}
        <div className="bg-muted-foreground/20 h-3 w-3/5 rounded" />

        {/* Items count + menu icon */}
        <div className="flex items-center justify-between">
          <div className="bg-muted-foreground/20 h-2.5 w-9 rounded" />
          {/* <div className="bg-muted-foreground/20 h-4 w-4 rounded-full" /> */}
          <MoreVertical className="text-muted-foreground/20 h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default VaultCardSkeleton;
