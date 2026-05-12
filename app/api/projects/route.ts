import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: decoded.userId }
      }
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  })

  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const project = await prisma.project.create({
    data: {
      name,
      creatorId: decoded.userId,
      members: {
        create: {
          userId: decoded.userId,
          role: 'ADMIN'
        }
      }
    }
  })

  return NextResponse.json({ project })
}
