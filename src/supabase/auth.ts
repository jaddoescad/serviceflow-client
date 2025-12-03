import { createSupabaseServerClient } from './clients/server'
import { redirect } from 'next/navigation'

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
