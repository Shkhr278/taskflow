"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) router.push('/login')
        else setUser(data.user)
      })

    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects) setProjects(data.projects)
      })
  }, [router])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName })
    })
    const data = await res.json()
    if (data.project) {
      setProjects([...projects, { ...data.project, members: [{ user }] }])
      setNewProjectName('')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name} ({user.email})</p>
      <button onClick={handleLogout}>Logout</button>
      
      <h2>Your Projects</h2>
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreateProject}>
        <input type="text" placeholder="New Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
        <button type="submit">Create Project</button>
      </form>
    </div>
  )
}
