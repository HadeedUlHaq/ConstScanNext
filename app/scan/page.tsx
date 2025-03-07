"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Webcam from "react-webcam"
import { Camera, Download, Redo, Save, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { uploadDocument } from "@/lib/document-actions"

export default function ScanPage() {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("camera")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setCapturedImage(imageSrc)
    }
  }, [webcamRef])

  const retake = () => {
    setCapturedImage(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageSource: string) => {
    setIsProcessing(true)

    // In a real app, you would process the image here
    // For now, we'll just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsProcessing(false)
    return imageSource // Return the processed image
  }

  const saveDocument = async () => {
    if (!documentName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a document name",
      })
      return
    }

    setIsSaving(true)

    try {
      const imageToSave = activeTab === "camera" ? capturedImage : uploadedImage
      if (!imageToSave) {
        throw new Error("No image to save")
      }

      const processedImage = await processImage(imageToSave)

      // Upload to Firebase
      await uploadDocument({
        name: documentName,
        imageData: processedImage,
        type: "scan",
      })

      toast({
        title: "Success",
        description: "Document saved successfully",
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

  const downloadImage = () => {
    const imageToDownload = activeTab === "camera" ? capturedImage : uploadedImage
    if (!imageToDownload) return

    const link = document.createElement("a")
    link.href = imageToDownload
    link.download = `${documentName || "document"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Scan Document</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {!capturedImage ? (
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured document"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={retake} variant="outline">
                      <Redo className="mr-2 h-4 w-4" />
                      Retake
                    </Button>
                    <Button onClick={downloadImage} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
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
                    <p className="mt-2 text-sm font-medium text-muted-foreground">Click to upload or drag and drop</p>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Label>
                  {uploadedImage && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded document"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
                {uploadedImage && (
                  <Button onClick={downloadImage} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(capturedImage || uploadedImage) && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>
              <Button onClick={saveDocument} disabled={isProcessing || isSaving} className="w-full">
                {isProcessing ? (
                  "Processing image..."
                ) : isSaving ? (
                  "Saving document..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

