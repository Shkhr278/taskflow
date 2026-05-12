import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } }
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isMember = project.members.some(m => m.userId === decoded.userId)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ project })
}
