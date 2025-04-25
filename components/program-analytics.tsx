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

interface ProgramUsage {
  programId: string;
  uniqueWallets: number;
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
  const [programId, setProgramId] = useState("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
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
        <Button onClick={loadProgramData} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load Program"}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {programData && (
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
                <div className="text-2xl font-bold">{programData.uniqueWallets.toLocaleString()}</div>
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
      )}

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
                        return [
                          `Instruction: ${item.name}`,
                          `Percentage: ${value.toFixed(1)}%`,
                          `Transactions: ${item.count.toLocaleString()}`,
                          '───────────────',
                          `Data:`,
                          item.data
                        ].join('\n');
                      }}
                      showLegend={true}
                      className="h-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No instruction data available
                    </div>
                  )}
                </div>
                
                <div className="overflow-auto">
                  {instructionTypes.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">%</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {instructionTypes.map((instruction, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{instruction.name}</TableCell>
                            <TableCell className="text-right">{instruction.count.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{instruction.value.toFixed(1)}%</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {instruction.data}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Top Programs by Interaction</CardTitle>
              <CardDescription>Programs with most interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program ID</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Unique Wallets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPrograms.length > 0 ? (
                    topPrograms.map((program, index) => (
                      <TableRow key={program.programId}>
                        <TableCell className="font-medium">
                          <Link 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setProgramId(program.programId)
                              loadProgramData()
                            }}
                            className="hover:text-primary hover:underline"
                            title={program.programId}
                          >
                            {program.programId.slice(0, 6) + '...' + program.programId.slice(-6)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{program.totalTransactions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{program.uniqueWallets.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {isLoading ? "Loading program data..." : "No program data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
