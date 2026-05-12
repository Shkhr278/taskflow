"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('Signup failed')
    }
  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSignup}>
        <div><input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        <button type="submit">Signup</button>
      </form>
      <Link href="/login">Go to Login</Link>
    </div>
  )
}
