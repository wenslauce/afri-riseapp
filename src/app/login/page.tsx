import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to home page where auth is now handled
  redirect('/?tab=login')
}