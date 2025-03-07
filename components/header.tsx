import Link from "next/link"
import { FileText, LogOut, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getCurrentUser } from "@/lib/auth"
import { signOut } from "@/lib/auth-actions"

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 pt-4">
                <Link href="/" className="text-lg font-bold">
                  Document Scanner
                </Link>
                {user ? (
                  <>
                    <Link href="/scan" className="flex items-center gap-2 text-sm font-medium">
                      Scan Document
                    </Link>
                    <Link href="/upload" className="flex items-center gap-2 text-sm font-medium">
                      Upload Document
                    </Link>
                    <Link href="/documents" className="flex items-center gap-2 text-sm font-medium">
                      My Documents
                    </Link>
                    <form action={signOut}>
                      <Button variant="ghost" className="w-full justify-start p-0">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex items-center gap-2 text-sm font-medium">
                      Login
                    </Link>
                    <Link href="/register" className="flex items-center gap-2 text-sm font-medium">
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Document Scanner</span>
          </Link>
        </div>
        <nav className="hidden gap-6 md:flex">
          {user ? (
            <>
              <Link href="/scan" className="flex items-center gap-2 text-sm font-medium">
                Scan Document
              </Link>
              <Link href="/upload" className="flex items-center gap-2 text-sm font-medium">
                Upload Document
              </Link>
              <Link href="/documents" className="flex items-center gap-2 text-sm font-medium">
                My Documents
              </Link>
            </>
          ) : null}
        </nav>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/documents">My Documents</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOut} className="w-full">
                  <Button variant="ghost" className="w-full justify-start p-0">
                    Logout
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

