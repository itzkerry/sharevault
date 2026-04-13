import { Vault, VaultWithRelations } from "./vault";

export interface FetchVaultsResponse {
  vaults: VaultWithRelations[];
}

export interface CreateVaultResponse {
  vault: Vault;
}

export interface ApiError {
  error: string;
  message?: string;
}
