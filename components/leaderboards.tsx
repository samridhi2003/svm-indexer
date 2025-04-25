"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/ui/chart"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api, TopProgramResponse, TopWalletResponse } from "@/lib/api"

export function Leaderboards() {
  const [topPrograms, setTopPrograms] = useState<TopProgramResponse[]>([])
  const [topWallets, setTopWallets] = useState<TopWalletResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [programs, wallets] = await Promise.all([
          api.getTopPrograms(),
          api.getTopWallets()
        ])
        setTopPrograms(programs)
        setTopWallets(wallets)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setTopPrograms([])
        setTopWallets([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-2">Error loading data</div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  const programComparisonData = topPrograms.map(program => ({
    name: `${program.programId.slice(0, 8)}...${program.programId.slice(-4)}`,
    value: program.transactionCount
  }))

  const walletComparisonData = topWallets.map(wallet => ({
    name: `${wallet.address.slice(0, 8)}...${wallet.address.slice(-4)}`,
    value: wallet.transactionCount
  }))

  return (
    <div className="space-y-4">
      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Top Programs</TabsTrigger>
          <TabsTrigger value="wallets">Top Wallets</TabsTrigger>
        </TabsList>
        <TabsContent value="programs">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Program Transaction Volume</CardTitle>
                <CardDescription>Top 5 programs by transaction count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart
                    data={programComparisonData}
                    index="name"
                    categories={["value"]}
                    colors={["#6366f1"]}
                    valueFormatter={(value) => `${value.toLocaleString()} txs`}
                    showLegend={false}
                    showGridLines={true}
                    startEndOnly={true}
                    layout="horizontal"
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Programs</CardTitle>
                <CardDescription>Most active programs on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Growth (7d)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPrograms.map((program, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">
                            <Link href={`/programs/${program.programId}`} className="hover:text-primary hover:underline">
                              {program.programId}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>{program.transactionCount.toLocaleString()}</TableCell>
                        <TableCell>{program.uniqueUsers.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={program.growthPercentage > 0 ? "text-emerald-500" : "text-red-500"}>
                            {program.growthPercentage > 0 ? "+" : ""}{program.growthPercentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="wallets">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Wallet Transaction Volume</CardTitle>
                <CardDescription>Top 10 wallets by transaction count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart
                    data={walletComparisonData}
                    index="name"
                    categories={["value"]}
                    colors={["#6366f1"]}
                    valueFormatter={(value) => `${value.toLocaleString()} txs`}
                    showLegend={false}
                    showGridLines={true}
                    startEndOnly={true}
                    layout="horizontal"
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Wallets</CardTitle>
                <CardDescription>Most active wallets on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead className="text-right">Transaction Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topWallets.map((wallet, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">
                            <Link href={`/?address=${wallet.address}&tab=Wallet Overview`} className="hover:text-primary hover:underline">
                              {wallet.address}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{wallet.transactionCount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
