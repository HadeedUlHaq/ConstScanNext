"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    try {
      const result = await signIn(formData)
      console.log("Sign in result:", result) // Add this line for debugging

      if (result?.error) {
        throw new Error(result.error)
      }

      // If we get here, it means the sign-in was successful
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      })
      router.push("/") // Redirect to home page
    } catch (error: any) {
      console.error("Sign in error:", error) // Add this line for debugging
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] pt-16">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
        <p className="text-sm text-muted-foreground">Enter your email and password to login</p>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoCapitalize="none"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Register
        </Link>
      </div>
    </div>
  )
}

