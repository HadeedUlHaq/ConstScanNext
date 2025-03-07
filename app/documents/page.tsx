import Link from "next/link";
import Image from "next/image";
import { FileText, Plus, Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { getDocuments } from "@/lib/document-actions";
import { DeleteDocumentButton } from "@/components/delete-document-button";

interface Document {
  id: string;
  name?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileType?: string;
  createdAt?: string;
}

export default async function DocumentsPage() {
  const user = await requireAuth();
  const documents: Document[] = await getDocuments();

  console.log("Documents Data:", documents);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                {document.fileType === 'pdf' ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <FileText className="h-24 w-24 text-slate-400" />
                  </div>
                ) : (
                  <Image
                    src={document.imageUrl || "/placeholder.svg"}
                    alt={document.name || "No Image"}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1">{document.name || "Untitled Document"}</CardTitle>
                <CardDescription>
                  {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : "Unknown Date"}
                  {document.fileType && <span className="ml-2 rounded bg-slate-100 px-2 py-1 text-xs">{document.fileType.toUpperCase()}</span>}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between p-4 pt-0">
                <div className="flex gap-2">
                  {/* View Button */}
                  {(document.fileUrl || document.imageUrl) && (
                    <Link href={document.fileUrl || document.imageUrl || '#'} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  )}
                  
                  {/* Download Button */}
                  {(document.fileUrl || document.imageUrl) && (
                    <a 
                      href={document.fileUrl || document.imageUrl || '#'} 
                      download={document.name || `document.${document.fileType || 'jpg'}`}
                      className="inline-flex"
                    >
                      <Button variant="default" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  )}
                </div>
                <DeleteDocumentButton id={document.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}