import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { email } = await req.json()

  const projectMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: decoded.userId, projectId: id } }
  })

  if (!projectMember || projectMember.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 })
  }

  const userToAdd = await prisma.user.findUnique({ where: { email } })
  if (!userToAdd) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    const member = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: id,
        role: 'MEMBER'
      }
    })
    return NextResponse.json({ member })
  } catch (error) {
    return NextResponse.json({ error: 'User already in project' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { userId } = await req.json()

  const projectMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: decoded.userId, projectId: id } }
  })

  if (!projectMember || projectMember.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 })
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId: id } }
  })

  return NextResponse.json({ success: true })
}
