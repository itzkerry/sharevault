import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { slugSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const result = slugSchema.safeParse({ slug });
    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const vault = await prisma.vault.findUnique({
      where: { slug: result.data.slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        media: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vault) {
      return Response.json({ error: "Vault not found" }, { status: 404 });
    }

    return Response.json({ vault });
  } catch (error) {
    console.error("Error retrieving shared vault: ", error);
    return Response.json(
      { error: "Failed to fetch shared vault" },
      { status: 500 }
    );
  }
}
