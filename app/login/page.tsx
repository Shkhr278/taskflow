"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('Login failed')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        <button type="submit">Login</button>
      </form>
      <Link href="/signup">Go to Signup</Link>
    </div>
  )
}
