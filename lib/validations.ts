import z from "zod";

export const createVaultSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(100).optional(),
})



export const createMediaSchema = z.object({
    name: z.string().min(1,"Name is required").max(100),
    fileId: z.string().min(1, "File Id is required"),
    url: z.url("Invalied URL"),
    thumbnailUrl: z.url("Invalied URL").optional(),
    type: z.enum(["IMAGE", "VIDEO"]),
    size: z.number().positive("Size must be positive"),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    duration: z.number().positive().optional(),
    vaultId: z.string().min(1, "Vault ID is required"),
})

export const deleteMediaSchema = z.object({
    ids: z.array(z.string().min(1,"Invaild Id")).min(1,"Please select at least one media")
})

export const vaultIdSchema = z.object({
    id: z.string().min(1,"Vault Id is required")
})

export const slugSchema = z.object({
    slug: z.string().min(1,"slug is required")
})

