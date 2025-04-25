"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function DashboardHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 py-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <div className="h-8 w-8 rounded-full bg-primary"></div>
                <span className="text-primary font-bold text-xl">SONIC</span>
              </Link>
              <Link href="/" className="text-sm font-medium hover:underline">
                Cluster Stats
              </Link>
              <Link href="/transactions" className="text-sm font-medium hover:underline">
                Transactions
              </Link>
              <Link href="/wallet" className="text-sm font-medium hover:underline">
                Supply
              </Link>
              <Link href="/programs" className="text-sm font-medium hover:underline">
                Inspector
              </Link>
              <Link href="/leaderboards" className="text-sm font-medium hover:underline">
                Blocks
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:mr-6">
          <div className="h-8 w-8 rounded-full bg-primary"></div>
          <span className="text-primary font-bold text-xl">SONIC</span>
        </Link>

        <nav className="hidden md:flex md:gap-6 lg:gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Cluster Stats
          </Link>
          <Link href="/transactions" className="text-sm font-medium hover:text-primary">
            Supply
          </Link>
          <Link href="/wallet" className="text-sm font-medium hover:text-primary">
            Inspector
          </Link>
          <Link href="/programs" className="text-sm font-medium hover:text-primary">
            Transactions
          </Link>
          <Link href="/leaderboards" className="text-sm font-medium hover:text-primary">
            Blocks
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <Input
                type="search"
                placeholder="Search for blocks, accounts, transactions, programs, and tokens"
                className="w-[200px] md:w-[400px] lg:w-[500px] bg-card border-border"
              />
              <Button variant="ghost" size="icon" className="absolute right-0" onClick={() => setIsSearchOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Button className="bg-primary text-white rounded-md ml-2">Testnet V1</Button>
        </div>
      </div>
    </header>
  )
}
