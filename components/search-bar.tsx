"use client"

import { Search, X, SortAsc, SortDesc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortField = "name" | "type" | "createdAt"
type SortDirection = "asc" | "desc"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterType: string | null
  onFilterChange: (type: string | null) => void
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: SortField, direction: SortDirection) => void
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
}: SearchBarProps) {
  const handleClear = () => {
    onSearchChange("")
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange("name", "asc")}
              className={sortField === "name" && sortDirection === "asc" ? "bg-muted" : ""}
            >
              <SortAsc className="mr-2 h-4 w-4" />
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("name", "desc")}
              className={sortField === "name" && sortDirection === "desc" ? "bg-muted" : ""}
            >
              <SortDesc className="mr-2 h-4 w-4" />
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("createdAt", "desc")}
              className={sortField === "createdAt" && sortDirection === "desc" ? "bg-muted" : ""}
            >
              <SortDesc className="mr-2 h-4 w-4" />
              Date (Newest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("createdAt", "asc")}
              className={sortField === "createdAt" && sortDirection === "asc" ? "bg-muted" : ""}
            >
              <SortAsc className="mr-2 h-4 w-4" />
              Date (Oldest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("type", "asc")}
              className={sortField === "type" && sortDirection === "asc" ? "bg-muted" : ""}
            >
              <SortAsc className="mr-2 h-4 w-4" />
              Type (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("type", "desc")}
              className={sortField === "type" && sortDirection === "desc" ? "bg-muted" : ""}
            >
              <SortDesc className="mr-2 h-4 w-4" />
              Type (Z-A)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === null ? "outline" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onFilterChange(null)}
        >
          All
        </Button>
        <Button
          variant={filterType === "pdf" ? "outline" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onFilterChange("pdf")}
        >
          PDF
        </Button>
        <Button
          variant={filterType === "image" ? "outline" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onFilterChange("image")}
        >
          Images
        </Button>
      </div>
    </div>
  )
}

