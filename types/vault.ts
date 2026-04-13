import { createMediaSchema } from "@/lib/validations";
import z from "zod";

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface Media {
  id: string;
  name: string;
  fileId: string;
  url: string;
  thumbnailUrl: string | null;
  type: MediaType;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  vaultId: string;
  createdAt: string;
}

export interface Vault {
  id: string;
  name: string;
  slug: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  media?: Media[];
}

// Intersections are great to keep here too
export type VaultWithRelations = Vault & {
  media: Media[];
  _count: {
    media: number;
  };
};

export type ImageKitAuthResponse = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};
export type CreateMediaPayload = z.infer<typeof createMediaSchema>;
export type SharedVault = Vault & {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  media: Media[];
};
