import Link from "next/link"
import { Camera, FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-4xl font-bold">Document Scanner</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Scan, save, and organize your documents with our easy-to-use web app.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
              Welcome, {user.displayName || user.email}
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Scan, save, and organize your documents with our easy-to-use web app.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/scan" className="group relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col items-center justify-center gap-1 p-6">
                <Camera className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Scan Document</h3>
                <p className="text-sm text-muted-foreground">Use your camera to scan a document</p>
              </div>
            </Link>
            <Link href="/upload" className="group relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col items-center justify-center gap-1 p-6">
                <Upload className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Upload Document</h3>
                <p className="text-sm text-muted-foreground">Upload an existing document</p>
              </div>
            </Link>
            <Link href="/documents" className="group relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col items-center justify-center gap-1 p-6">
                <FileText className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">My Documents</h3>
                <p className="text-sm text-muted-foreground">View and manage your documents</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

