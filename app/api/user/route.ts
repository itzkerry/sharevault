import { authOptions } from "@/lib/authOptions";
import { imagekit } from "@/lib/imagekit";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";


export async function DELETE(){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        };
        const mediaFiles = await prisma.media.findMany({
            where: {
                vault : {userId : session.user.id}
            }
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
        await prisma.user.delete({
            where:{id: session.user.id}
        })

        return Response.json({success:true})

    }catch(error){
       console.error("Error deleting user : ",error);
        return Response.json(
            {error: "Failed to delete user"},
            {status: 500}
        )
    }
}