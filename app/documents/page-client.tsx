"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Download, Eye, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteDocumentButton } from "@/components/delete-document-button"
import { RenameDocumentDialog } from "@/components/rename-document-dialog"
import { MultiSelectActions } from "@/components/multi-select-actions"
import { SearchBar } from "@/components/search-bar"

interface Document {
  id: string
  name?: string
  imageUrl?: string
  fileUrl?: string
  pdfUrl?: string
  fileType?: string
  type?: string
  createdAt?: string
}

interface DocumentsClientProps {
  initialDocuments: Document[]
}

type SortField = "name" | "type" | "createdAt"
type SortDirection = "asc" | "desc"

export function DocumentsClient({ initialDocuments }: DocumentsClientProps) {
  const [documents] = useState<Document[]>(initialDocuments)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Filter documents based on search query and filter type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = !searchQuery || (doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const fileType = doc.fileType || doc.type || ""
    const matchesType = !filterType || fileType.toLowerCase() === filterType.toLowerCase()

    return matchesSearch && matchesType
  })

  // Sort documents based on sort field and direction
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue: any = a[sortField] || ""
    let bValue: any = b[sortField] || ""

    // Special handling for type field
    if (sortField === "type") {
      aValue = a.fileType || a.type || ""
      bValue = b.fileType || b.type || ""
    }

    // Special handling for name field
    if (sortField === "name") {
      aValue = a.name || "Untitled Document"
      bValue = b.name || "Untitled Document"
    }

    // For string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // For date comparison
    if (sortField === "createdAt") {
      const aDate = aValue ? new Date(aValue).getTime() : 0
      const bDate = bValue ? new Date(bValue).getTime() : 0
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate
    }

    return 0
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
  }

  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) return null

    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  return (
    <div>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      <div className="rounded-md border mt-4">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <Checkbox id="select-all" />
                </th>
                <th
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    File Name
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    Type
                    {renderSortIcon("type")}
                  </div>
                </th>
                <th
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date Uploaded
                    {renderSortIcon("createdAt")}
                  </div>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No documents found
                  </td>
                </tr>
              ) : (
                sortedDocuments.map((document) => {
                  const fileUrl = document.fileUrl || document.pdfUrl || document.imageUrl
                  const fileType = document.fileType || document.type || "image"
                  const fileName = document.name || "Untitled Document"
                  const dateUploaded = document.createdAt
                    ? new Date(document.createdAt).toLocaleDateString()
                    : "Unknown Date"

                  return (
                    <tr
                      key={document.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">
                        <Checkbox id={`select-${document.id}`} />
                      </td>
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center gap-2">
                          {fileType === "pdf" ? (
                            <FileText className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-green-500" />
                          )}
                          <span className="truncate max-w-[200px]">{fileName}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {fileType.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">{dateUploaded}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          {fileUrl && (
                            <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                          )}

                          {fileUrl && (
                            <a href={fileUrl} download={`${fileName}.${fileType}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </a>
                          )}

                          <RenameDocumentDialog id={document.id} currentName={fileName}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Rename</span>
                            </Button>
                          </RenameDocumentDialog>

                          <DeleteDocumentButton id={document.id}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </DeleteDocumentButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <MultiSelectActions />
    </div>
  )
}

