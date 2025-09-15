import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Redirect to home page where auth is now handled
  redirect('/?tab=signup')
}