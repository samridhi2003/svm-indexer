"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Search, RefreshCw, Download, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"
import type { Transaction } from "@/lib/api"

const formatAmount = (amount: string) => {
  // Convert from lamports to SOL (1 SOL = 1e9 lamports)
  const sol = Number(amount) / 1e9
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL`
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getTransactions(10, 0)
      setTransactions(data)
    } catch (err) {
      setError("Failed to fetch transactions. Please try again later.")
      console.error("Error fetching transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchTransactions()
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Try to fetch by signature first
      try {
        const tx = await api.getTransactionBySignature(query.trim())
        setTransactions([tx])
        return
      } catch (err) {
        // If signature search fails, filter existing transactions
        const filteredTxs = transactions.filter(tx =>
          tx.signature.toLowerCase().includes(query.toLowerCase()) ||
          tx.data.from.toLowerCase().includes(query.toLowerCase()) ||
          tx.data.to.toLowerCase().includes(query.toLowerCase())
        )
        setTransactions(filteredTxs)
      }
    } catch (err) {
      setError("Failed to search transactions. Please try again later.")
      console.error("Error searching transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Filter transactions based on search only
  const filteredTransactions = transactions.filter((tx) => {
    return true;
  })

  const handleRefresh = () => {
    if (searchQuery) {
      handleSearch(searchQuery)
    } else {
      fetchTransactions()
    }
  }

  // Export handler
  const handleExport = () => {
    if (!transactions.length) return;
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportToAI = (platform: 'chatgpt' | 'claude') => {
    if (!transactions.length) return;
    const json = JSON.stringify(transactions, null, 2);
    
    if (platform === 'chatgpt') {
      const prompt = `Please analyze these blockchain transactions and explain their key patterns, trends, and insights:\n\n${json}`;
      window.open(`https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`, '_blank');
    } else {
      // For Claude, we'll create a more structured prompt
      const claudePrompt = `I have some blockchain transaction data that I'd like you to analyze. Here are the key metrics:\n\n` +
        `Number of Transactions: ${transactions.length}\n` +
        `Time Range: ${new Date(Number(transactions[0].blockTime) * 1000).toLocaleString()} to ${new Date(Number(transactions[transactions.length - 1].blockTime) * 1000).toLocaleString()}\n\n` +
        `Here's the complete data in JSON format:\n\n${json}\n\n` +
        `Please analyze this data and provide insights about:\n` +
        `1. Transaction patterns and frequency\n` +
        `2. Value flows and amounts\n` +
        `3. Notable transaction types or patterns\n` +
        `4. Potential anomalies or interesting trends`;
      
      const claudeUrl = `https://claude.ai/chat?prompt=${encodeURIComponent(claudePrompt)}`;
      window.open(claudeUrl, '_blank');
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
            <CardDescription>Browse and filter the most recent blockchain transactions</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by signature or address"
                className="pl-8 w-[200px] md:w-[250px] bg-background"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
              />
            </div>

            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" title="Export" disabled={!transactions.length}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9" 
              title="Ask AI" 
              disabled={!transactions.length}
              onClick={() => handleExportToAI('chatgpt')}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">Ask AI</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-secondary/20">
                <TableHead className="w-[250px]">Signature</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.signature} className="border-border hover:bg-secondary/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Link href={`/transactions/${tx.signature}`} className="hover:text-primary truncate max-w-[200px]">
                          {tx.signature.slice(0, 8)}...{tx.signature.slice(-4)}
                        </Link>
                        <Link href={`/transactions/${tx.signature}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(Number(tx.blockTime) * 1000).toLocaleString()}</TableCell>
                    <TableCell>{tx.slot}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        <Link href={`/?address=${tx.data.from}&tab=Wallet Overview`} className="hover:text-primary hover:underline">
                          {tx.data.from.slice(0, 8)}...{tx.data.from.slice(-4)}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        <Link href={`/?address=${tx.data.to}&tab=Wallet Overview`} className="hover:text-primary hover:underline">
                          {tx.data.to.slice(0, 8)}...{tx.data.to.slice(-4)}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{formatAmount(tx.data.amount)}</TableCell>
                    <TableCell>{(Number(tx.fee) / 1e9).toFixed(6)} SOL</TableCell>
                    <TableCell>
                      <Badge variant={tx.status.toLowerCase() === "success" ? "success" : "destructive"}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

