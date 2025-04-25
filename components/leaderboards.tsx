"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/ui/chart"
import Link from "next/link"

// Mock leaderboard data
const topPrograms = [
  {
    id: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    name: "Token Program",
    transactions: 1245789,
    users: 45678,
    growth: "+5.2%",
  },
  {
    id: "11111111111111111111111111111111",
    name: "System Program",
    transactions: 987654,
    users: 38765,
    growth: "+3.7%",
  },
  {
    id: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    name: "Associated Token Account Program",
    transactions: 854321,
    users: 32456,
    growth: "+4.1%",
  },
  {
    id: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    name: "Memo Program",
    transactions: 743210,
    users: 28765,
    growth: "+2.8%",
  },
  {
    id: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    name: "Metaplex Token Metadata Program",
    transactions: 621098,
    users: 21543,
    growth: "+6.3%",
  },
]

const topWallets = [
  {
    address: "8xh3hBrUwgCoPLGNzd88vwzAQm2M3iSoPrNvb51G74xQ",
    transactions: 12457,
    balance: "1,245,789 SOL",
    type: "Exchange",
  },
  {
    address: "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
    transactions: 9876,
    balance: "987,654 SOL",
    type: "Whale",
  },
  {
    address: "9xVte8qcmgQWVUHmHXKgV6qY1wqmzRQBP9xQnpYnRmHT",
    transactions: 8543,
    balance: "854,321 SOL",
    type: "Exchange",
  },
  {
    address: "7ZmLWMqWJTwzN7Tk8yUc9mLiMVjVHZvxWvJH7dU89vHy",
    transactions: 7432,
    balance: "743,210 SOL",
    type: "DAO",
  },
  {
    address: "3qw9K8mL5JZqVCiE2kzP7vPRf7A5Q8LHkX2pVwpVxm2X",
    transactions: 6210,
    balance: "621,098 SOL",
    type: "Whale",
  },
]

// Chart data for program comparison
const programComparisonData = [
  {
    program: "Token Program",
    transactions: 1245789,
  },
  {
    program: "System Program",
    transactions: 987654,
  },
  {
    program: "Associated Token",
    transactions: 854321,
  },
  {
    program: "Memo Program",
    transactions: 743210,
  },
  {
    program: "Metaplex",
    transactions: 621098,
  },
]

export function Leaderboards() {
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
                    index="program"
                    categories={["transactions"]}
                    colors={["#6366f1"]}
                    valueFormatter={(value) => `${value.toLocaleString()} txs`}
                    showLegend={false}
                    showGridLines={false}
                    startEndOnly={false}
                    layout="vertical"
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
                            <Link href={`/programs/${program.id}`} className="hover:text-primary hover:underline">
                              {program.name}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {program.id.slice(0, 8)}...{program.id.slice(-4)}
                          </div>
                        </TableCell>
                        <TableCell>{program.transactions.toLocaleString()}</TableCell>
                        <TableCell>{program.users.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-500">
                            {program.growth}
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
          <Card>
            <CardHeader>
              <CardTitle>Top Wallets</CardTitle>
              <CardDescription>Most active wallets on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topWallets.map((wallet, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">
                          <Link href={`/?address=${wallet.address}&tab=Wallet Overview`} className="hover:text-primary hover:underline">
                            {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{wallet.transactions.toLocaleString()}</TableCell>
                      <TableCell>{wallet.balance}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{wallet.type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
