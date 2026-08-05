import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Load all portfolios for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { portfolios: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ portfolios: user.portfolios });
  } catch (error) {
    console.error('Error loading portfolios:', error);
    return NextResponse.json({ error: 'Failed to load portfolios' }, { status: 500 });
  }
}

// POST - Save a portfolio
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { id, title, description, data } = body;

    // Upsert: update if exists, create if not
    const portfolio = await prisma.portfolio.upsert({
      where: { id: id || 'new' },
      update: {
        title,
        description,
        data: JSON.stringify(data),
        updatedAt: new Date(),
      },
      create: {
        title: title || 'Untitled Portfolio',
        description,
        data: JSON.stringify(data),
        userId: user.id,
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 });
  }
}

// DELETE - Delete a portfolio
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 });
    }

    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
