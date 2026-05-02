import { redirect } from "next/navigation"
import { Database, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockDataFeatures, seedFeatureMockData } from "@/modules/mock-data-services"

async function seedMockDataAction(formData: FormData) {
  "use server"

  const feature = String(formData.get("feature") ?? "")
  let redirectTo = "/mock-data"

  try {
    await seedFeatureMockData(feature)
    redirectTo = `/mock-data?seeded=${encodeURIComponent(feature)}`
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown seed error"
    redirectTo = `/mock-data?error=${encodeURIComponent(message)}`
  }

  redirect(redirectTo)
}

interface MockDataPageProps {
  searchParams: Promise<{
    seeded?: string
    error?: string
  }>
}

export default async function MockDataPage({ searchParams }: MockDataPageProps) {
  const params = await searchParams

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Mock Data</h1>
          <p className="text-muted-foreground">
            Seed local module mock data to Firestore collections.
          </p>
        </div>
        <form action={seedMockDataAction}>
          <input type="hidden" name="feature" value="all" />
          <Button className="cursor-pointer">
            <UploadCloud className="h-4 w-4" />
            Seed All
          </Button>
        </form>
      </div>

      {params.seeded && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CardContent className="text-sm text-green-700 dark:text-green-300">
            Seed completed for <strong>{params.seeded}</strong>.
          </CardContent>
        </Card>
      )}

      {params.error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="text-sm text-red-700 dark:text-red-300">
            {params.error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feature Seeders</CardTitle>
          <CardDescription>
            Collection names use plural nouns, for example <code>tasks</code> and{" "}
            <code>users</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDataFeatures.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">mock-data-services.ts</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={seedMockDataAction}>
                      <input type="hidden" name="feature" value={feature.id} />
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Seed
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
