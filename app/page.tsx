import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { TransactionsList } from "@/components/transactions-list"
import { WalletOverview } from "@/components/wallet-overview"
import { ProgramAnalytics } from "@/components/program-analytics"
import { Leaderboards } from "@/components/leaderboards"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="wallet">Wallet Overview</TabsTrigger>
              <TabsTrigger value="programs">Program Analytics</TabsTrigger>
              <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="space-y-4">
              <TransactionsList />
            </TabsContent>
            <TabsContent value="wallet" className="space-y-4">
              <WalletOverview />
            </TabsContent>
            <TabsContent value="programs" className="space-y-4">
              <ProgramAnalytics />
            </TabsContent>
            <TabsContent value="leaderboards" className="space-y-4">
              <Leaderboards />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
