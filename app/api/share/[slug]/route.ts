import { authOptions } from "@/lib/authOptions"
import { getServerSession } from "next-auth"
import { slugSchema} from '@/lib/validations';
import { prisma } from "@/lib/prisma";

export async function GET(
    request:Request,
    {params} : {params : {slug:string} }
){
    try{
        const session = await getServerSession(authOptions);
        if(!session?.user){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        const result = slugSchema.safeParse(params);
        if(!result.success){
            return Response.json(
                {error: result.error.issues[0].message},
                {status: 400}
            )
        }
        const {slug} = result.data;
        const vault = await prisma.vault.findUnique({
            where: {
                slug,
            }
        })

        if(!vault){
            return Response.json(
                {error: "Vault not found"},
                {status: 404}
            )
        }
    
        const medias = await prisma.media.findMany({
            where: {vaultId : vault.id},
            orderBy: {
                createdAt: "desc"
            }
        })
        return Response.json({vault , medias});

    }catch(error){
        console.error("Error retriving shared media : ",error);
        return Response.json(
            {error: "Failed to fetch shared media"},
            {status: 500}
        )
    }
}