import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  const projectMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: decoded.userId, projectId } }
  })

  if (!projectMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignee: true }
  })

  const totalTasks = tasks.length
  
  const tasksByStatus = tasks.reduce((acc: any, task: any) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tasksPerUser = tasks.reduce((acc: any, task: any) => {
    const name = task.assignee?.name || 'Unassigned'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const now = new Date()
  const overdueTasks = tasks.filter((task: any) => task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE').length

  return NextResponse.json({
    totalTasks,
    tasksByStatus,
    tasksPerUser,
    overdueTasks
  })
}
