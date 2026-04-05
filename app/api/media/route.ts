import { authOptions } from "@/lib/authOptions";
import { imagekit } from "@/lib/imagekit";
import { prisma } from "@/lib/prisma";
import { createMediaSchema, deleteMediaSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";


export async function POST(request:Request){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        const body = await request.json();
        const result = createMediaSchema.safeParse(body);
        if(!result.success){
            return Response.json(
                {error: result.error.issues[0].message},
                {status: 400}
            )
        }
        const {
            name, 
            fileId, 
            url, 
            thumbnailUrl, 
            type,
            size,
            width,
            height,
            duration,
            vaultId
        } = result.data;

        const media = await prisma.media.create({
            data:{
                name,
                fileId, 
                url, 
                thumbnailUrl, 
                type,
                size,
                width,
                height,
                duration,
                vaultId
            }
        })

        return Response.json({media},{status:201});

    }catch(error){
        console.error("Error creating media : ",error);
        return Response.json(
            {error: "Failed to create media"},
            {status: 500}
        )
    }
}


export async function DELETE(request:Request){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        const body = await request.json();
        const result = deleteMediaSchema.safeParse(body);
        if(!result.success){
            return Response.json(
                {error: result.error.issues[0].message},
                {status: 400}
            )
        }
        const {ids} = result.data;
        const mediaFiles = await prisma.media.findMany({
            where:{
                id: {in:ids},
                vault: {userId: session.user.id}
            }
        })

        if (mediaFiles.length === 0) {
            return Response.json({ error: "No media found" }, { status: 404 })
        }

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

        await prisma.media.deleteMany({
            where: {
                id: {in: ids},
                vault: {userId: session.user.id}
            }
        })
        return Response.json({success:true})

    }catch(error){
        console.error("Error deleting media : ",error);
        return Response.json(
            {error: "Failed to delete media"},
            {status: 500}
        )
    }
}