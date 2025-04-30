"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { AreaChart, BarChart } from "@/components/ui/chart"
import { api, Transaction, WalletTransactionResponse } from "@/lib/api"
import { count } from "console"
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, MessageSquare } from "lucide-react"

interface WalletData {
  address: string;
  lamports: string;
  usdValue: string;
  tokens: Array<{
    mint: string;
    amount: number;
    decimals: number;
  }>;
  count: number;
  firstActivity: string;
  lastActivity: string;
}

interface TokenTransfer {
  signature: string;
  blockTime: string;
  transfers: Array<{
    mint?: string;
    amount?: string;
    value?: string;
    name?: string;
  }>;
}

const formatAmount = (lamports: string) => {
  // Convert from lamports to SOL (1 SOL = 1e9 lamports)
  const sol = Number(lamports) / 1e9
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL`
}

export function WalletOverview() {
  const [address, setAddress] = useState("")
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tokenTransfers, setTokenTransfers] = useState<TokenTransfer[]>([])
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  const loadWalletData = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      // Fetch wallet balances
      const balances = await api.getWalletBalances(address)
      console.log('Wallet balances:', balances)
      setWalletData(balances)

      try {
        // Fetch transactions for the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        // Fetch transactions using the API
        const response = await api.getWalletTransactions(address, 100)
        console.log('API Response:', response)
        
        // Map the API response to our Transaction format
        let transactions: Transaction[] = []
        
        if (response && response.transactions) {
          transactions = response.transactions.map(tx => ({
            signature: tx.signature,
            slot: tx.slot,
            blockTime: tx.blockTime,
            time: new Date(parseInt(tx.blockTime) * 1000).toISOString(), // Convert Unix timestamp to ISO string
            fee: tx.fee,
            status: tx.status,
            data: {
              from: tx.data.accounts[0],
              to: tx.data.accounts[1],
              amount: "0"
            }
          }))

          // Find the most recent transaction
          const lastTransaction = response.transactions
            .sort((a, b) => parseInt(b.blockTime) - parseInt(a.blockTime))[0]
          
          if (lastTransaction) {
            const lastActivityDate = new Date(parseInt(lastTransaction.blockTime) * 1000)
            setWalletData(prev => {
              if (!prev) return prev
              return {
                ...prev,
                lastActivity: lastActivityDate.toISOString()
              }
            })
          }
        }
        
        console.log('Parsed transactions:', transactions)
        
        // Filter for recent transactions
        const recentTransactions = transactions.filter(tx => 
          tx && tx.time && new Date(tx.time) >= sevenDaysAgo
        )
          
        console.log('Recent transactions:', recentTransactions)
        
        setTransactions(recentTransactions)

        const count_response = await api.getWalletTransactionCount(address)

        setCount(count_response.count)
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
        setCount(0)
      }

      // Fetch token transfers
      const transfers = await api.getWalletTokenTransfers(address)
      setTokenTransfers(transfers)
    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processActivityData = () => {
    if (!transactions?.length) {
      console.log('No transactions to process')
      return []
    }
    
    const activityMap = new Map()
    const dates = []
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dates.push(dateStr)
      activityMap.set(dateStr, { date: dateStr, sent: 0, received: 0 })
    }
    
    // Process each transaction
    transactions.forEach(tx => {
      if (!tx || !tx.time || !tx.data) return
      
      const txDate = new Date(tx.time)
      const date = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      if (activityMap.has(date)) {
        const entry = activityMap.get(date)
        if (tx.data.from === address) {
          entry.sent++
        } else if (tx.data.to === address) {
          entry.received++
        }
      }
    })
    
    const result = dates.map(date => activityMap.get(date))
    console.log('Activity data for chart:', result)
    return result
  }

  const activityData = processActivityData()

  // Process token transfers into a format suitable for display
  const processTokenData = () => {
    const tokens = [];
    
    // Add SOL if wallet data exists
    if (walletData?.lamports) {
      const solAmount = (parseFloat(walletData.lamports) / 1e9).toString(); // Convert lamports to SOL
      tokens.push({
        mint: "So11111111111111111111111111111111111111112", // Native SOL mint address
        amount: solAmount,
        value: walletData.usdValue?.replace(/[^0-9.]/g, "") || "0",
        name: "SOL"
      });
    }

    // Process other tokens from wallet data
    if (walletData?.tokens?.length) {
      walletData.tokens.forEach(token => {
        tokens.push({
          mint: token.mint,
          amount: token.amount.toString(),
          value: "0", // Value not provided in new format
          name: token.mint.slice(0, 8) + '...'
        });
      });
    }

    return tokens;
  };

  const tokens = processTokenData();
  const bubbleData = tokens.map((token, idx) => ({
    x: idx + 1,
    y: parseFloat(String(token.amount ?? 0).replace(/[^0-9.]/g, "")) || 0,
    z: parseFloat(String(token.amount ?? 0).replace(/[^0-9.]/g, "")) || 0,
    name: token.name,
    mint: token.mint,
    amount: String(token.amount ?? 0)
  }));

  function BubbleMapChart() {
    if (!bubbleData.length) {
      return <div className="flex h-full items-center justify-center text-muted-foreground">No token data available</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis dataKey="x" name="Token Index" tick={false} />
          <YAxis dataKey="y" name="Amount" />
          <ZAxis dataKey="z" range={[60, 400]} name="Amount" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="rounded bg-background p-2 text-xs shadow">
                    <div><b>{d.name}</b></div>
                    <div>Mint: {d.mint}</div>
                    <div>Amount: {d.amount}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter data={bubbleData} fill="#6366f1" name="Tokens" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const handleExport = () => {
    if (!walletData) return;
    const json = JSON.stringify(walletData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-${walletData.address}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportToAI = (platform: 'chatgpt' | 'claude') => {
    if (!walletData) return;
    const json = JSON.stringify(walletData, null, 2);
    
    if (platform === 'chatgpt') {
      const prompt = `Please analyze this blockchain wallet data and explain its key metrics, patterns, and insights:\n\n${json}`;
      window.open(`https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`, '_blank');
    } else {
      // For Claude, we'll create a more structured prompt
      const claudePrompt = `I have some blockchain wallet data that I'd like you to analyze. Here are the key metrics:\n\n` +
        `Wallet Address: ${walletData.address}\n` +
        `Balance: ${formatAmount(walletData.lamports)}\n` +
        `USD Value: ${walletData.usdValue}\n` +
        `Number of Tokens: ${walletData.tokens.length}\n\n` +
        `Here's the complete data in JSON format:\n\n${json}\n\n` +
        `Please analyze this data and provide insights about:\n` +
        `1. Wallet activity and transaction patterns\n` +
        `2. Token holdings and distribution\n` +
        `3. Value trends and portfolio composition\n` +
        `4. Notable activities or patterns`;
      
      const claudeUrl = `https://claude.ai/chat?prompt=${encodeURIComponent(claudePrompt)}`;
      window.open(claudeUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Enter wallet address" 
            className="pl-8" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={loadWalletData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load Wallet'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!walletData}>
                <Download className="mr-2 h-4 w-4" />
                Export
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
            disabled={!walletData}
            onClick={() => handleExportToAI('chatgpt')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask AI
          </Button>
        </div>
      </div>

      {walletData && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(walletData.lamports)}</div>
                <p className="text-xs text-muted-foreground">{walletData.usdValue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">All-time transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {walletData?.lastActivity ? (
                    new Date(walletData.lastActivity).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : (
                    'Invalid Date'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Last transaction</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="bubble">Bubble Map</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Activity</CardTitle>
                  <CardDescription>Last 7 days of sent and received transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {transactions && transactions.length > 0 ? (
                      <>
                        <div className="mb-4 text-sm text-muted-foreground">
                          Debug: Found {transactions.length} transactions
                        </div>
                        <BarChart
                          data={processActivityData()}
                          index="date"
                          categories={["sent", "received"]}
                          colors={["#ef4444", "#22c55e"]}
                          valueFormatter={(value) => `${value} transaction${value !== 1 ? 's' : ''}`}
                          showLegend={true}
                          showGridLines={true}
                          startEndOnly={false}
                          layout="horizontal"
                          className="h-full [&>div>div]:!bg-transparent [&_.recharts-cartesian-grid-bg]:!fill-transparent [&_.recharts-tooltip-cursor]:!fill-transparent [&_.recharts-default-tooltip]:!bg-background"
                        />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No transaction data available ({transactions ? transactions.length : 0} transactions)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tokens">
              <Card>
                <CardHeader>
                  <CardTitle>Token Holdings</CardTitle>
                  <CardDescription>All tokens in this wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <div>MINT ADDRESS</div>
                      <div>TOTAL BALANCE</div>
                    </div>
                    {tokens.length > 0 ? (
                      tokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M3 21h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M3 9h18M3 15h18" />
                            </svg>
                            <span className="text-blue-400">{token.mint}</span>
                          </div>
                          <div>
                            <div className="font-medium">{token.amount}</div>
                            {token.name !== token.mint && (
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No tokens found in this wallet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="bubble">
              <Card>
                <CardHeader>
                  <CardTitle>Token Bubble Map</CardTitle>
                  <CardDescription>Each bubble represents a token. Size and Y-axis both represent amount.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BubbleMapChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
