import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const decoded = await getUserFromCookies()
  if (!decoded) return NextResponse.json({ user: null })

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, name: true, email: true }
  })

  return NextResponse.json({ user })
}
