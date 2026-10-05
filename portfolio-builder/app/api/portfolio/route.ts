import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Basic validation of the request and portfolio structure.
const saveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  data: z.object({
    sections: z.array(z.record(z.unknown())),
    theme: z.record(z.unknown()),
  }).passthrough(),
});

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw NextResponse.json(
      { error: 'Please sign in first' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    throw NextResponse.json(
      { error: 'User not found' },
      { status: 401 }
    );
  }

  return user.id;
}

function handleError(error: unknown) {
  if (error instanceof Response) return error;

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return NextResponse.json(
      { error: 'Portfolio not found or not owned by you' },
      { status: 404 }
    );
  }

  console.error('Portfolio API error:', error);

  return NextResponse.json(
    { error: 'Unable to complete the request' },
    { status: 500 }
  );
}

// Load only the signed-in user's portfolios.
export async function GET() {
  try {
    const userId = await requireUserId();

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ portfolios });
  } catch (error) {
    return handleError(error);
  }
}

// Create a portfolio, or update one owned by this user.
export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => null);
    const result = saveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid portfolio data' },
        { status: 400 }
      );
    }

    const { id, title, description, data } = result.data;

    const values = {
      title,
      description: description ?? null,
      data: JSON.stringify(data),
    };

    const portfolio = id
      ? await prisma.portfolio.update({
          where: { id, userId },
          data: values,
        })
      : await prisma.portfolio.create({
          data: { ...values, userId },
        });

    return NextResponse.json(
      { portfolio },
      { status: id ? 200 : 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

// Delete only a portfolio owned by this user.
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const result = z.string().uuid().safeParse(req.nextUrl.searchParams.get('id'));

    if (!result.success) {
      return NextResponse.json(
        { error: 'A valid portfolio ID is required' },
        { status: 400 }
      );
    }

    await prisma.portfolio.delete({
      where: { id: result.data, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
