import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { initFirebaseAdminApp } from "./firebase-admin"

export async function getCurrentUser() {
  const cookieStore = cookies()
  const session = cookieStore.get("session")?.value

  if (!session) {
    return null
  }

  try {
    const { auth, firestore } = initFirebaseAdminApp()
    const decodedClaims = await auth.verifySessionCookie(session, true)

    if (!decodedClaims) {
      return null
    }

    const user = await auth.getUser(decodedClaims.uid)
    return user
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

