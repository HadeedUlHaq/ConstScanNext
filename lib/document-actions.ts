"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { initFirebaseAdminApp } from "./firebase-admin"
import { requireAuth } from "./auth"

interface DocumentData {
  name: string
  imageData: string
  type: "scan" | "upload" | "pdf"
}

export async function uploadDocument(data: DocumentData) {
  const user = await requireAuth()

  try {
    const { firestore, storage } = initFirebaseAdminApp()

    // Generate a unique ID for the document
    const documentId = uuidv4()

    // Determine file extension and content type based on the document type and data
    let fileExtension = "png"
    let contentType = "image/png"
    let fileData: Buffer

    if (data.type === "pdf") {
      console.log("PDF upload detected, data length:", data.imageData.length)
      fileExtension = "pdf"
      contentType = "application/pdf"
      
      try {
        // Handle different possible PDF data URI formats
        if (data.imageData.startsWith("data:application/pdf;base64,")) {
          fileData = Buffer.from(data.imageData.replace(/^data:application\/pdf;base64,/, ""), "base64")
        } else if (data.imageData.startsWith("data:;base64,")) {
          fileData = Buffer.from(data.imageData.replace(/^data:;base64,/, ""), "base64")
        } else if (data.imageData.includes(";base64,")) {
          // More generic approach for any base64 data
          fileData = Buffer.from(data.imageData.substring(data.imageData.indexOf(";base64,") + 8), "base64")
        } else {
          // Assume it's already base64 without the data URI prefix
          fileData = Buffer.from(data.imageData, "base64")
        }
        console.log("Buffer created successfully, size:", fileData.length)
      } catch (e) {
        console.error("Error creating buffer for PDF:", e)
        throw new Error(`PDF buffer creation failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    } else {
      // For images (scan or upload types)
      try {
        fileData = Buffer.from(data.imageData.replace(/^data:image\/\w+;base64,/, ""), "base64")
        console.log("Image buffer created, size:", fileData.length)
      } catch (e) {
        console.error("Error creating buffer for image:", e)
        throw new Error(`Image buffer creation failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // Upload file to Firebase Storage
    const bucket = storage.bucket()
    const file = bucket.file(`documents/${user.uid}/${documentId}.${fileExtension}`)

    console.log(`Uploading ${fileExtension} file to Firebase Storage...`)
    try {
      await file.save(fileData, {
        metadata: {
          contentType: contentType,
        },
        resumable: false // For smaller files, this can help with reliability
      })
      console.log("File saved successfully")
    } catch (e) {
      console.error("Error saving file to storage:", e)
      throw new Error(`Firebase Storage upload failed: ${e instanceof Error ? e.message : String(e)}`)
    }

    // Get the public URL
    try {
      await file.makePublic()
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`
      console.log("File made public, URL:", fileUrl)
    } catch (e) {
      console.error("Error making file public:", e)
      throw new Error(`Failed to make file public: ${e instanceof Error ? e.message : String(e)}`)
    }

    // Calculate file size in KB
    const fileSizeKB = Math.round(fileData.length / 1024)

    // Save document metadata to Firestore
    try {
      await firestore.collection("documents").doc(documentId).set({
        id: documentId,
        name: data.name,
        type: data.type,
        fileUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        fileSize: fileSizeKB, // Store file size in KB
        fileExtension: fileExtension
      })
      console.log("Document metadata saved to Firestore")
    } catch (e) {
      console.error("Error saving to Firestore:", e)
      // Try to clean up the already uploaded file
      await file.delete().catch(deleteErr => 
        console.error("Cleanup failed:", deleteErr instanceof Error ? deleteErr.message : String(deleteErr))
      )
      throw new Error(`Firestore document creation failed: ${e instanceof Error ? e.message : String(e)}`)
    }

    revalidatePath("/documents")
    return { success: true, id: documentId }
  } catch (error: unknown) {
    console.error("Error uploading document:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to upload document"
    throw new Error(errorMessage)
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
  } catch (error: unknown) {
    console.error("Error getting documents:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to get documents"
    throw new Error(errorMessage)
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

    // Get document type to determine file extension
    const fileExtension = data?.fileExtension || (data?.type === "pdf" ? "pdf" : "png")

    // Delete from Storage
    const bucket = storage.bucket()
    const file = bucket.file(`documents/${user.uid}/${id}.${fileExtension}`)
    await file.delete().catch((err: unknown) => {
      console.warn(`Could not delete file from storage: ${err instanceof Error ? err.message : String(err)}`)
      // Ignore if file doesn't exist
    })

    // Delete from Firestore
    await docRef.delete()

    revalidatePath("/documents")
    return { success: true }
  } catch (error: unknown) {
    console.error("Error deleting document:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete document"
    throw new Error(errorMessage)
  }
}