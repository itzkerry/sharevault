import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { vaultIdSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";

export async function PATCH(
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
        const slug = `${vault.name.toLocaleLowerCase().replace(/\s+/g, "-")}-${crypto.randomUUID().slice(0,8)}`
        const updateVault = await prisma.vault.update({
            where:{id},
            data:{slug}
        })
        return Response.json({vault:updateVault});

    }catch(error){
        console.error("Error sharing vault : ",error);
        return Response.json(
            {error: "Failed to share vault"},
            {status: 500}
        )
    }
}