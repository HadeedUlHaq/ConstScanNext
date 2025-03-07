"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Webcam from "react-webcam"
import { Camera, Download, Edit, File, Save, Trash, Upload } from "lucide-react"
import { jsPDF } from "jspdf"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { uploadDocument } from "@/lib/document-actions"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ScanPage() {
  const webcamRef = useRef<Webcam>(null)
  const [images, setImages] = useState<{ id: string; data: string; name: string }[]>([])
  const [currentEditingImageId, setCurrentEditingImageId] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("camera")
  const [captureMode, setCaptureMode] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        const newImageId = generateId()
        setImages((prev) => [...prev, { id: newImageId, data: imageSrc, name: `Scan ${prev.length + 1}` }])
        toast({
          title: "Image captured",
          description: `Image ${images.length + 1} added to collection`,
        })
      }
    }
  }, [webcamRef, images.length, toast])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const newImageId = generateId()
          setImages((prev) => [
            ...prev,
            { id: newImageId, data: reader.result as string, name: file.name.replace(/\.[^/.]+$/, "") },
          ])
        }
        reader.readAsDataURL(file)
      })
      e.target.value = ""
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const openEditDialog = (id: string) => {
    setCurrentEditingImageId(id)
  }

  const closeEditDialog = () => {
    setCurrentEditingImageId(null)
  }

  const updateImageName = (id: string, newName: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, name: newName } : img)))
  }

  const processImages = async () => {
    setIsProcessing(true)

    // In a real app, you would process each image here
    // For now, we'll just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsProcessing(false)
    return images // Return the processed images
  }

  const saveAsPdf = async () => {
    if (!documentName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a document name",
      })
      return
    }

    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No images to save",
      })
      return
    }

    setIsSaving(true)

    try {
      const processedImages = await processImages()

      // Create PDF
      const pdf = new jsPDF()

      for (let i = 0; i < processedImages.length; i++) {
        const img = processedImages[i]
        // If not the first page, add a new page
        if (i > 0) {
          pdf.addPage()
        }

        // Add image to PDF
        pdf.addImage(img.data, "PNG", 0, 0, 210, 297) // A4 size in mm
      }

      // Convert to base64 for storage
      const pdfData = pdf.output("datauristring")

      // Upload to Firebase
      await uploadDocument({
        name: documentName,
        imageData: pdfData,
        type: "pdf", // Now this is a valid type
      })

      toast({
        title: "Success",
        description: `Document with ${images.length} pages saved successfully`,
      })

      router.push("/documents")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save document",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const downloadAsPdf = () => {
    if (images.length === 0) return

    // Create PDF
    const pdf = new jsPDF()

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      // If not the first page, add a new page
      if (i > 0) {
        pdf.addPage()
      }

      // Add image to PDF
      pdf.addImage(img.data, "PNG", 0, 0, 210, 297) // A4 size in mm
    }

    // Save PDF
    pdf.save(`${documentName || "document"}.pdf`)
  }

  const currentEditingImage = currentEditingImageId ? images.find((img) => img.id === currentEditingImageId) : null

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Scan Multiple Documents</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {captureMode ? (
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={{ facingMode: "environment" }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button onClick={capture} size="lg" className="rounded-full">
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                  </div>
                  {images.length > 0 && (
                    <div className="absolute right-4 top-4">
                      <Button
                        onClick={() => setCaptureMode(false)}
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      >
                        View {images.length} Images
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Captured Images ({images.length})</h3>
                    <Button onClick={() => setCaptureMode(true)} variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Back to Camera
                    </Button>
                  </div>
                  {images.length > 0 ? (
                    <div className="relative">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {images.map((image, index) => (
                            <CarouselItem key={image.id}>
                              <div className="relative p-1">
                                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                                  <img
                                    src={image.data || "/placeholder.svg"}
                                    alt={`Document ${index + 1}`}
                                    className="h-full w-full object-contain"
                                  />
                                  <div className="absolute bottom-4 right-4 flex gap-2">
                                    <Button
                                      onClick={() => openEditDialog(image.id)}
                                      size="sm"
                                      variant="outline"
                                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      onClick={() => removeImage(image.id)}
                                      size="sm"
                                      variant="destructive"
                                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="mt-2 text-center font-medium">{image.name}</p>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">No images captured yet</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Label
                    htmlFor="file-upload"
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 px-4 py-5 text-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      Click to upload or drag and drop multiple files
                    </p>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Label>

                  {images.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium">Uploaded Images ({images.length})</h3>
                      <div className="relative w-full">
                        <Carousel className="w-full">
                          <CarouselContent>
                            {images.map((image, index) => (
                              <CarouselItem key={image.id}>
                                <div className="relative p-1">
                                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                                    <img
                                      src={image.data || "/placeholder.svg"}
                                      alt={`Document ${index + 1}`}
                                      className="h-full w-full object-contain"
                                    />
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                      <Button
                                        onClick={() => openEditDialog(image.id)}
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/80 backdrop-blur-sm hover:bg-white"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        onClick={() => removeImage(image.id)}
                                        size="sm"
                                        variant="destructive"
                                        className="bg-white/80 backdrop-blur-sm hover:bg-white"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-center font-medium">{image.name}</p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {images.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Create PDF with {images.length} pages</span>
                </div>
                <Button variant="outline" size="sm" onClick={downloadAsPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Preview PDF
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>

              <Button onClick={saveAsPdf} disabled={isProcessing || isSaving} className="w-full">
                {isProcessing ? (
                  "Processing images..."
                ) : isSaving ? (
                  "Saving document..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save as PDF Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Image Dialog */}
      <Dialog open={!!currentEditingImageId} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update the image name and make other adjustments</DialogDescription>
          </DialogHeader>

          {currentEditingImage && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={currentEditingImage.data || "/placeholder.svg"}
                  alt="Edit"
                  className="w-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-name">Image Name</Label>
                <Input
                  id="image-name"
                  value={currentEditingImage.name}
                  onChange={(e) => updateImageName(currentEditingImage.id, e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    removeImage(currentEditingImage.id)
                    closeEditDialog()
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={closeEditDialog}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

