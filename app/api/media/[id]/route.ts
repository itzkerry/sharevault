import { authOptions } from "@/lib/authOptions"
import { getServerSession } from "next-auth"
import { vaultIdSchema } from '@/lib/validations';
import { prisma } from "@/lib/prisma";

export async function GET(
    request:Request,
    {params} : {params : {vaultId:string} }
){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
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
    
        const medias = await prisma.media.findMany({
            where: {vaultId : id},
            orderBy: {
                createdAt: "desc"
            }
        })
        return Response.json({medias});

    }catch(error){
        console.error("Error retriving media : ",error);
        return Response.json(
            {error: "Failed to fetch media"},
            {status: 500}
        )
    }
}