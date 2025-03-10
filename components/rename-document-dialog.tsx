"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { renameDocument } from "@/lib/document-actions"

interface RenameDocumentDialogProps {
  id: string
  currentName: string
  children: React.ReactNode
}

export function RenameDocumentDialog({ id, currentName, children }: RenameDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState(currentName)
  const [isRenaming, setIsRenaming] = useState(false)
  const { toast } = useToast()

  async function handleRename() {
    if (!newName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Document name cannot be empty",
      })
      return
    }

    setIsRenaming(true)
    try {
      await renameDocument(id, newName)
      toast({
        title: "Success",
        description: "Document renamed successfully",
      })
      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to rename document",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Document</DialogTitle>
          <DialogDescription>Enter a new name for your document.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleRename} disabled={isRenaming}>
            {isRenaming ? "Renaming..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

