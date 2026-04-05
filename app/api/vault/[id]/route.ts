import { authOptions } from "@/lib/authOptions";
import { imagekit } from "@/lib/imagekit";
import { prisma } from "@/lib/prisma";
import { vaultIdSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";

export async function DELETE(
    request:Request,
    {params}: {params : {id : string}}
){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        };
 
        const result = vaultIdSchema.safeParse(params);
        if(!result.success){
            return Response.json(
                {error: result.error.issues[0].message},
                {status: 400}
            )
        }
        const {id} = result.data; 

        const vault = await prisma.vault.findUnique({
            where: {
                id,
                userId: session.user.id
            }
        })

        if(!vault){
            return Response.json(
                {error: "Vault not found"},
                {status: 404}
            )
        }

        const mediaFiles = await prisma.media.findMany({
            where:{vaultId: vault.id}
        })

        if(mediaFiles.length > 0){
            const results = await Promise.allSettled(
                mediaFiles.map(media => imagekit.deleteFile(media.fileId))
            )

            const orphaned = results.
                map((result,index) => ({result, media:mediaFiles[index]})).
                filter(({result}) => result.status === "rejected")

            if(orphaned.length > 0){
                await prisma.orphanedMedia.createMany({
                    data: orphaned.map(({result,media}) => ({
                        fileId: media.fileId,
                        reason: (result as PromiseRejectedResult).reason?.message || "Unknown error"
                    }))
                })
            }
        }

        await prisma.vault.delete({
            where: {id}
        })
        return Response.json({success:true})
    }catch(error){
        console.error("Error getting Vaults : ",error);
        return Response.json(
            {error: "Failed to fetch vault"},
            {status: 500}
        )
    }
}