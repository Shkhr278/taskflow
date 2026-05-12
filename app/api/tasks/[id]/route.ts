import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { title, description, dueDate, priority, status, assigneeId } = await req.json()

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const projectMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: decoded.userId, projectId: task.projectId } }
  })

  if (!projectMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Admin can manage everything.
  // Member can only update assigned tasks, typically just the status, but we will let them update the whole task if they are the assignee for simplicity, 
  // wait, the req says "Member: View and update assigned tasks only".
  if (projectMember.role !== 'ADMIN' && task.assigneeId !== decoded.userId) {
    return NextResponse.json({ error: 'Forbidden. You can only update your assigned tasks.' }, { status: 403 })
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status,
      assigneeId: projectMember.role === 'ADMIN' ? assigneeId : undefined // Only admin can change assignee
    }
  })

  return NextResponse.json({ task: updatedTask })
}
