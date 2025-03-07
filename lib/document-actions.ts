"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { initFirebaseAdminApp } from "./firebase-admin"
import { requireAuth } from "./auth"

interface DocumentData {
  name: string
  imageData: string
  type: "scan" | "upload"
}

export async function uploadDocument(data: DocumentData) {
  const user = await requireAuth()

  try {
    const { firestore, storage } = initFirebaseAdminApp()

    // Generate a unique ID for the document
    const documentId = uuidv4()

    // Convert base64 image to buffer
    const imageBuffer = Buffer.from(data.imageData.replace(/^data:image\/\w+;base64,/, ""), "base64")

    // Upload image to Firebase Storage
    const bucket = storage.bucket()
    const file = bucket.file(`documents/${user.uid}/${documentId}.png`)

    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
      },
    })

    // Get the public URL
    await file.makePublic()
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`

    // Save document metadata to Firestore
    await firestore.collection("documents").doc(documentId).set({
      id: documentId,
      name: data.name,
      type: data.type,
      imageUrl,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    })

    revalidatePath("/documents")
    return { success: true }
  } catch (error: any) {
    console.error("Error uploading document:", error)
    throw new Error(error.message || "Failed to upload document")
  }
}

export async function getDocuments() {
  const user = await requireAuth()

  try {
    const { firestore } = initFirebaseAdminApp()

    const snapshot = await firestore
      .collection("documents")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get()

    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return documents
  } catch (error: any) {
    console.error("Error getting documents:", error)
    throw new Error(error.message || "Failed to get documents")
  }
}

export async function deleteDocument(id: string) {
  const user = await requireAuth()

  try {
    const { firestore, storage } = initFirebaseAdminApp()

    // Get the document to check ownership
    const docRef = firestore.collection("documents").doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new Error("Document not found")
    }

    const data = doc.data()

    if (data?.userId !== user.uid) {
      throw new Error("Unauthorized")
    }

    // Delete from Storage
    const bucket = storage.bucket()
    const file = bucket.file(`documents/${user.uid}/${id}.png`)
    await file.delete().catch(() => {
      // Ignore if file doesn't exist
    })

    // Delete from Firestore
    await docRef.delete()

    revalidatePath("/documents")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting document:", error)
    throw new Error(error.message || "Failed to delete document")
  }
}

