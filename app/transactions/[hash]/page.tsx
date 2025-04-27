"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, ExternalLink, RefreshCw, Settings, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { api } from "@/lib/api"
import type { Transaction } from "@/lib/api"
import { toast } from "sonner"

const formatAmount = (amount: string) => {
  // Convert from lamports to SOL (1 SOL = 1e9 lamports)
  const sol = Number(amount) / 1e9
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL`
}

const formatDate = (blockTime: string) => {
  if (!blockTime) return ""
  try {
    const date = new Date(parseInt(blockTime) * 1000)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

export default function TransactionDetailsPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetchTransaction = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getTransactionBySignature(hash)
      console.log("Received transaction data:", data) // Debug log
      console.log("BlockTime:", data.blockTime) // Debug log for blockTime
      setTransaction(data)
    } catch (err) {
      setError("Failed to fetch transaction details")
      console.error("Error fetching transaction:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransaction()
  }, [hash])

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      toast.success("Copied to clipboard")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
      console.error("Failed to copy:", err)
    }
  }

  const handleRefresh = () => {
    fetchTransaction()
  }

  const handleExport = () => {
    if (!transaction) return;
    const json = JSON.stringify(transaction, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaction-${transaction.signature}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center h-64">
              Loading transaction details...
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-lg border border-destructive p-4 text-destructive">
              {error || "Transaction not found"}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="mb-6">
            <div className="text-sm text-muted-foreground uppercase">DETAILS</div>
            <h1 className="text-2xl font-bold">Transaction</h1>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Overview</h2>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Inspect
              </Button> */}
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2" title="Export" onClick={handleExport} disabled={!transaction}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card className="border-border bg-card mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center py-4 border-b border-border">
                <div className="font-medium">Signature</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm">{transaction.signature}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleCopy(transaction.signature, 'signature')}
                  >
                    {copiedField === 'signature' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span className="sr-only">Copy signature</span>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center py-4">
                <div className="font-medium">Result</div>
                <Badge variant={transaction.status.toLowerCase() === "success" ? "success" : "destructive"}>
                  {transaction.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                  <div>{transaction?.blockTime ? formatDate(transaction.blockTime) : "Loading..."}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Slot</div>
                  <div>{transaction.slot}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Fee</div>
                  <div>{(Number(transaction.fee) / 1e9).toFixed(6)} SOL</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Amount</div>
                  <div>{formatAmount(transaction.data.amount)}</div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">From</div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-background px-1 py-0.5 text-sm">{transaction.data.from}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(transaction.data.from, 'from')}
                    >
                      {copiedField === 'from' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="sr-only">Copy from address</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                      <Link href={`/?address=${transaction.data.from}&tab=Wallet Overview`}>
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">View address</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">To</div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-background px-1 py-0.5 text-sm">{transaction.data.to}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleCopy(transaction.data.to, 'to')}
                    >
                      {copiedField === 'to' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="sr-only">Copy to address</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                      <Link href={`/?address=${transaction.data.to}&tab=Wallet Overview`}>
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">View address</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
