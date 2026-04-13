import { CreateVaultResponse, FetchVaultsResponse } from "@/types/api";
import { createVaultSchema, vaultIdSchema } from "./validations";
import {
  CreateMediaPayload,
  ImageKitAuthResponse,
  Media,
  SharedVault,
  Vault,
} from "@/types/vault";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Request failed");
    }
    return response.json() as Promise<T>;
  }

  async deleteUser() {
    return this.fetch<{ success: boolean }>("/user", {
      method: "DELETE",
    });
  }
  async fetchVaults() {
    return this.fetch<FetchVaultsResponse>("/vault");
  }
  async createVault(name: string) {
    const result = createVaultSchema.safeParse({ name });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return this.fetch<CreateVaultResponse>("/vault", {
      method: "POST",
      body: { name },
    });
  }
  async shareVault(id: string) {
    const result = vaultIdSchema.safeParse({ id });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return this.fetch<{ vault: Vault }>(`/vault/${id}/share`, {
      method: "PATCH",
    });
  }

  async unshareVault(id: string) {
    const result = vaultIdSchema.safeParse({ id });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return this.fetch<{ vault: Vault }>(`/vault/${id}/unshare`, {
      method: "PATCH",
    });
  }

  async deleteVault(id: string) {
    const result = vaultIdSchema.safeParse({ id });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return this.fetch<{ success: boolean }>(`/vault/${id}`, {
      method: "DELETE",
    });
  }
  async fetchVault(id: string) {
    const result = vaultIdSchema.safeParse({ id });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return this.fetch<{ vault: Vault }>(`/vault/${id}`);
  }
  async getImageKitAuth() {
    return this.fetch<ImageKitAuthResponse>("/imagekit-auth");
  }
  async createMedia(payload: CreateMediaPayload) {
    return this.fetch<{ media: Media }>("/media", {
      method: "POST",
      body: payload,
    });
  }
  async deleteMedia(ids: string[]) {
    return this.fetch<{ success: boolean }>("/media", {
      method: "DELETE",
      body: { ids },
    });
  }

  async fetchSharedVault(slug: string) {
    return this.fetch<{
      vault: SharedVault;
    }>(`/share/${slug}`);
  }
}

export const apiClient = new ApiClient();
