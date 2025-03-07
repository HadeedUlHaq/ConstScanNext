import Link from "next/link"
import Image from "next/image"
import { FileText, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuth } from "@/lib/auth"
import { getDocuments } from "@/lib/document-actions"
import { DeleteDocumentButton } from "@/components/delete-document-button"

export default async function DocumentsPage() {
  const user = await requireAuth()
  const documents = await getDocuments()

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Button asChild>
          <Link href="/scan">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No documents yet</h2>
          <p className="mt-2 text-muted-foreground">Start by scanning or uploading a document</p>
          <Button asChild className="mt-6">
            <Link href="/scan">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document: any) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src={document.imageUrl || "/placeholder.svg"}
                  alt={document.name}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-all hover:scale-105"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1">{document.name}</CardTitle>
                <CardDescription>{new Date(document.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Button asChild variant="outline" size="sm">
                  <Link href={document.imageUrl} target="_blank" rel="noopener noreferrer">
                    View
                  </Link>
                </Button>
                <DeleteDocumentButton id={document.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

