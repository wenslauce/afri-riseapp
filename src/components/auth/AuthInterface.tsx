'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ModernLoginForm from '@/components/auth/ModernLoginForm'
import ModernRegistrationForm from '@/components/auth/ModernRegistrationForm'

export default function AuthInterface() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('login')

  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Afri-Rise Equity Limited
          </h1>
          <p className="text-muted-foreground">
            Your trusted partner for financing solutions across Africa
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-6">
                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
                  <p className="text-muted-foreground">
                    Continue your loan application or check your application status
                  </p>
                </div>
                <ModernLoginForm />
              </TabsContent>
              
              <TabsContent value="signup" className="p-6">
                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Get started</h2>
                  <p className="text-muted-foreground">
                    Create your account to start your loan application process
                  </p>
                </div>
                <ModernRegistrationForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
