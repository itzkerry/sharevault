import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createVaultSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const vaults = await prisma.vault.findMany({
      where: { userId: session.user.id },
      include: {
        media: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { media: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ vaults });
  } catch (error) {
    console.error("Error getting Vaults : ", error);
    return Response.json({ error: "Failed to fetch vault" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createVaultSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name } = result.data;

    const vault = await prisma.vault.create({
      data: {
        name,
        userId: session.user.id,
      },
    });
    return Response.json({ vault }, { status: 201 });
  } catch (error) {
    console.error("Error creating Vault : ", error);
    return Response.json({ error: "Failed to create vault" }, { status: 500 });
  }
}
