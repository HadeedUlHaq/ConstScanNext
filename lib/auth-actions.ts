"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { initFirebaseAdminApp } from "./firebase-admin"
import { auth } from "./firebase"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    console.log("Attempting to sign in with email:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("User signed in successfully:", userCredential.user.uid)

    const idToken = await userCredential.user.getIdToken()

    const { auth: adminAuth } = initFirebaseAdminApp()
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    console.log("Session cookie set successfully")
    return { success: true }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { error: error.message || "Failed to sign in" }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  try {
    console.log("Attempting to create user with email:", email)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log("User created successfully:", userCredential.user.uid)

    if (name) {
      await updateProfile(userCredential.user, { displayName: name })
      console.log("User profile updated with name:", name)
    }

    const idToken = await userCredential.user.getIdToken()

    const { auth: adminAuth } = initFirebaseAdminApp()
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    console.log("Session cookie set successfully")
    return { success: true }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return { error: error.message || "Failed to sign up" }
  }
}

export async function signOut() {
  cookies().delete("session")
  console.log("User signed out successfully")
  redirect("/login")
}

