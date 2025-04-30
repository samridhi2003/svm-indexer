"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { AreaChart, DonutChart } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, MessageSquare } from "lucide-react"

interface ProgramUsage {
  programId: string;
  totalTransactions: number;
  topInstructions: Array<{
    data: string;
    count: number;
  }>;
  timeSeries: Array<{
    timestamp: number;
    count: number;
  }>;
}

interface ProgramInteraction {
  timestamp: number;
  transactions: number;
  uniqueWallets: number;
}

interface TopProgramData {
  programId: string;
  totalTransactions: number;
  uniqueWallets: number;
}

export function ProgramAnalytics() {
  const [programId, setProgramId] = useState("")
  const [programData, setProgramData] = useState<ProgramUsage | null>(null)
  const [interactions, setInteractions] = useState<ProgramInteraction[]>([])
  const [topPrograms, setTopPrograms] = useState<TopProgramData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Common program IDs to check
  const commonProgramIds = [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // Token Program
    "11111111111111111111111111111111", // System Program
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token
    "ComputeBudget111111111111111111111111111111", // Compute Budget
    "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K", // Magic Eden v2
    "hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk", // Auction House
  ]

  const validateProgramId = (id: string): boolean => {
    // Check if the program ID is a valid base58 string
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
    return base58Regex.test(id)
  }

  const loadProgramData = async () => {
    if (!programId) return
    setError(null)
    setIsLoading(true)

    if (!validateProgramId(programId)) {
      setError("Invalid program ID. Please enter a valid base58 program ID.")
      setIsLoading(false)
      return
    }

    try {
      // Get program usage data
      const usage = await api.getProgramUsage(programId)
      setProgramData(usage)

      // Get program interactions
      const interactionsData = await api.getProgramInteractions(programId)
      setInteractions(interactionsData)

      // Load data for common programs if this is one of them
      if (commonProgramIds.includes(programId)) {
        const promises = commonProgramIds
          .filter(id => id !== programId) // Skip current program
          .map(id => api.getProgramUsage(id))
        
        const results = await Promise.allSettled(promises)
        const successfulResults = results
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value)
        
        // Combine all program data including current program
        const allProgramData = [...successfulResults, usage]
          .map(data => ({
            programId: data.programId,
            totalTransactions: data.totalTransactions,
            uniqueWallets: data.uniqueWallets
          }))
          .sort((a, b) => b.totalTransactions - a.totalTransactions)
        
        setTopPrograms(allProgramData)
      }
    } catch (error) {
      console.error("Error loading program data:", error)
      setProgramData(null)
      setInteractions([])
      setTopPrograms([])
      setError("Failed to load program data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!programData) return;
    const json = JSON.stringify(programData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `program-${programData.programId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportToAI = (platform: 'chatgpt' | 'claude') => {
    if (!programData) return;
    const json = JSON.stringify(programData, null, 2);
    
    if (platform === 'chatgpt') {
      const prompt = `Please analyze this blockchain program data and explain its key metrics, patterns, and insights:\n\n${json}`;
      window.open(`https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`, '_blank');
    } else {
      // Removing Claude option
      return;
    }
  };

  useEffect(() => {
    loadProgramData()
  }, [])

  // Format data for charts
  const dailyTransactions = programData?.timeSeries?.map(item => ({
    date: new Date(item.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count
  })) || []

  const instructionTypes = programData?.topInstructions?.map((item, index) => ({
    name: `Instruction Type ${index + 1}`,
    value: (item.count / (programData?.totalTransactions || 1)) * 100,
    count: item.count,
    data: item.data.slice(0, 30) + (item.data.length > 30 ? '...' : '')
  })) || []

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Enter program ID" 
            className="pl-8" 
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={loadProgramData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Program"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!programData}>
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
            disabled={!programData}
            onClick={() => handleExportToAI('chatgpt')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask AI
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading program data...</p>
          </div>
        </div>
      ) : programData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Program Overview</CardTitle>
              <CardDescription>{programData.programId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Transactions</div>
                  <div className="text-2xl font-bold">{programData.totalTransactions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Unique Wallets</div>
                  <div className="text-2xl font-bold">{interactions[0].uniqueWallets.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Last Activity</div>
                  <div className="text-2xl font-bold">
                    {programData.timeSeries.length > 0 
                      ? new Date(programData.timeSeries[programData.timeSeries.length - 1].timestamp * 1000).toLocaleDateString() 
                      : 'No activity'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="users">Top Programs</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Transactions</CardTitle>
                  <CardDescription>Number of transactions per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {dailyTransactions.length > 0 ? (
                      <AreaChart
                        data={dailyTransactions}
                        index="date"
                        categories={["value"]}
                        colors={["#6366f1"]}
                        valueFormatter={(value) => `${value.toLocaleString()} txs`}
                        showLegend={false}
                        showGridLines={false}
                        startEndOnly={false}
                        className="h-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No transaction data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Instruction Types</CardTitle>
                  <CardDescription>Distribution of instruction types and their usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-[400px]">
                      {instructionTypes.length > 0 ? (
                        <DonutChart
                          data={instructionTypes}
                          index="name"
                          category="value"
                          colors={["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"]}
                          valueFormatter={(value) => {
                            const item = instructionTypes.find(i => i.value === value);
                            if (!item) return `${value.toFixed(1)}%`;
                            return `Instruction: ${item.name}\nPercentage: ${value.toFixed(1)}%\nTransactions: ${item.count.toLocaleString()}\n───────────────\nData: ${item.data}`;
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No instruction data available
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      {instructionTypes.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-muted-foreground/10">
                                <th className="px-2 py-1 text-left font-semibold">Type</th>
                                <th className="px-2 py-1 text-right font-semibold">Count</th>
                                <th className="px-2 py-1 text-right font-semibold">%</th>
                                <th className="px-2 py-1 text-left font-semibold">Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {instructionTypes.map((item, idx) => (
                                <tr key={item.name} className="border-b border-muted-foreground/5">
                                  <td className="px-2 py-1 flex items-center gap-2">
                                    <span
                                      className="inline-block w-3 h-3 rounded-full"
                                      style={{ backgroundColor: ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"][idx % 5] }}
                                    ></span>
                                    <span className="font-medium">{item.name}</span>
                                  </td>
                                  <td className="px-2 py-1 text-right">{item.count.toLocaleString()}</td>
                                  <td className="px-2 py-1 text-right">{item.value.toFixed(1)}%</td>
                                  <td className="px-2 py-1 font-mono truncate max-w-[120px]" title={item.data}>{item.data}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No instruction data available
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Top Programs</CardTitle>
                  <CardDescription>Programs with the most transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {topPrograms.length > 0 ? (
                      <AreaChart
                        data={topPrograms}
                        index="programId"
                        categories={["totalTransactions"]}
                        colors={["#6366f1"]}
                        valueFormatter={(value) => `${value.toLocaleString()} txs`}
                        showLegend={false}
                        showGridLines={false}
                        startEndOnly={false}
                        className="h-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No top program data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
