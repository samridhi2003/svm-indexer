"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function DashboardHeader() {
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
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:mr-6">
          <div className="h-8 w-8 rounded-full bg-primary"></div>
          <span className="text-primary font-bold text-xl">SONIC</span>
        </Link>

        <div className="ml-auto">
          <Button className="bg-primary text-white rounded-md">Mainnet</Button>
        </div>
      </div>
    </header>
  )
}
