import Link from "next/link"
import { FileText, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import { getDocuments } from "@/lib/document-actions"
import { DocumentsClient } from "./page-client"

export default async function DocumentsPage() {
  const user = await requireAuth()
  const documents = await getDocuments()

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Link href="/scan">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No documents yet</h2>
          <p className="mt-2 text-muted-foreground">Start by scanning or uploading a document</p>
          <Link href="/scan">
            <Button className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </Link>
        </div>
      ) : (
        <DocumentsClient initialDocuments={documents} />
      )}
    </div>
  )
}

