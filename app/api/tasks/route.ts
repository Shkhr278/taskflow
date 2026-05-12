import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, dueDate, priority, projectId, assigneeId } = await req.json()

  if (!title || !projectId) {
    return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 })
  }

  const projectMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: decoded.userId, projectId } }
  })

  if (!projectMember || projectMember.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin only can create tasks.' }, { status: 403 })
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      projectId,
      assigneeId
    }
  })

  return NextResponse.json({ task })
}
