import { authOptions } from "@/lib/authOptions";
import { getUploadAuthParams } from "@imagekit/next/server";
import { getServerSession } from "next-auth";

export async function GET(){
    try{
        const session = await getServerSession(authOptions);

        if(!session){
            return Response.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        const authenticationParameters = getUploadAuthParams({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string
        });

        return Response.json({
            ...authenticationParameters,
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string
        });

    }catch(error){
        console.error("ImageKit auth error: ", error);
        return Response.json(
            {error: "Authentication for Imagekit failed"},
            {status: 500}
        )
    }
}