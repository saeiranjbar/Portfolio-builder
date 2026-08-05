import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/portfolios - Get all portfolios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          projects: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      return NextResponse.json(portfolios);
    }

    const portfolios = await prisma.portfolio.findMany({
      include: {
        projects: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

// POST /api/portfolios - Create a new portfolio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, data, userId } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        description: description || null,
        data,
        userId,
      },
      include: {
        projects: true,
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}
