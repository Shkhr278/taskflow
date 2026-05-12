"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProjectDetails() {
  const router = useRouter()
  const { id: projectId } = useParams()
  const [project, setProject] = useState<any>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assigneeId: '' })

  const loadData = async () => {
    const meRes = await fetch('/api/auth/me')
    const meData = await meRes.json()
    setUser(meData.user)

    const projRes = await fetch(`/api/projects/${projectId}`)
    const projData = await projRes.json()
    if (projData.project) setProject(projData.project)

    const dashRes = await fetch(`/api/dashboard?projectId=${projectId}`)
    const dashData = await dashRes.json()
    if (!dashData.error) setDashboard(dashData)
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newMemberEmail })
    })
    setNewMemberEmail('')
    loadData()
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, projectId, assigneeId: newTask.assigneeId || null })
    })
    setNewTask({ title: '', description: '', dueDate: '', priority: 'MEDIUM', assigneeId: '' })
    loadData()
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadData()
  }

  if (!project || !user) return <div>Loading...</div>

  const myRole = project.members.find((m: any) => m.userId === user.id)?.role

  return (
    <div>
      <Link href="/dashboard">Back to Dashboard</Link>
      <h1>Project: {project.name}</h1>
      <p>Role: {myRole}</p>

      {dashboard && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{dashboard.totalTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Overdue Tasks</h3>
            <p>{dashboard.overdueTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Tasks by Status</h3>
            <ul>
              {Object.entries(dashboard.tasksByStatus).map(([status, count]) => (
                <li key={status}><span>{status}</span> <strong>{String(count)}</strong></li>
              ))}
            </ul>
          </div>
          <div className="stat-card">
            <h3>Tasks per User</h3>
            <ul>
              {Object.entries(dashboard.tasksPerUser).map(([name, count]) => (
                <li key={name}><span>{name}</span> <strong>{String(count)}</strong></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <h2>Members</h2>
      <ul>
        {project.members.map((m: any) => (
          <li key={m.id}>{m.user.name} ({m.user.email}) - {m.role}</li>
        ))}
      </ul>

      {myRole === 'ADMIN' && (
        <form onSubmit={handleAddMember}>
          <input type="email" placeholder="Add member by email" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required />
          <button type="submit">Add Member</button>
        </form>
      )}

      <h2>Tasks</h2>
      <ul>
        {project.tasks.map((t: any) => (
          <li key={t.id}>
            <strong>{t.title}</strong> - {t.status} - Priority: {t.priority} - Assignee: {t.assignee?.name || 'Unassigned'}
            {(myRole === 'ADMIN' || t.assigneeId === user.id) && (
              <select value={t.status} onChange={e => handleUpdateTaskStatus(t.id, e.target.value)}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            )}
          </li>
        ))}
      </ul>

      {myRole === 'ADMIN' && (
        <div>
          <h3>Create Task</h3>
          <form onSubmit={handleCreateTask}>
            <input type="text" placeholder="Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
            <input type="text" placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
            <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <select value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {project.members.map((m: any) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
            <button type="submit">Create Task</button>
          </form>
        </div>
      )}
    </div>
  )
}
