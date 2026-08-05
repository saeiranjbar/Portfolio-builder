import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const portfolioId = searchParams.get('portfolioId');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    if (featured !== null) {
      where.featured = featured === 'true';
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      content,
      thumbnail,
      liveUrl,
      repoUrl,
      technologies,
      featured,
      order,
      userId,
      portfolioId,
    } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        content: content || null,
        thumbnail: thumbnail || null,
        liveUrl: liveUrl || null,
        repoUrl: repoUrl || null,
        technologies: technologies || null,
        featured: featured ?? false,
        order: order ?? 0,
        userId,
        portfolioId: portfolioId || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
