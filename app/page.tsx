import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            TackItAll
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track anything, analyze everything
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">View Demo</Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                Boolean Tracking
              </CardTitle>
              <CardDescription>Track yes/no habits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Perfect for daily habits like exercise, meditation, or reading.
                Get percentage statistics automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">#</span>
                Number Tracking
              </CardTitle>
              <CardDescription>Track numeric values</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor weight, steps, calories, or any numeric value.
                See averages, min, max, and trends.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Text Tracking
              </CardTitle>
              <CardDescription>Track notes and moods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep daily journals, mood logs, or any text-based entries.
                Search and review your history.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                Duration Tracking
              </CardTitle>
              <CardDescription>Track time spent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Log workout time, study sessions, or any duration.
                See total and average time in HH:MM format.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">€</span>
                Currency Tracking
              </CardTitle>
              <CardDescription>Track expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor daily expenses, savings, or any monetary value.
                Get total and average spending statistics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Statistics
              </CardTitle>
              <CardDescription>Comprehensive analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatic calculations, percentages, trends over time.
                All your data visualized beautifully.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Development Status</CardTitle>
            <CardDescription>Phase 2 Complete - Application Layer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Domain Layer</span>
                <span className="text-sm text-green-600">✓ Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Application Layer</span>
                <span className="text-sm text-green-600">✓ Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>156 tests passing</strong> across 11 test files
              </p>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>✓ 5 Tracker Types (Boolean, Number, Text, Duration, Currency)</li>
                <li>✓ CRUD Operations (Create, Add, Update, Delete Entries)</li>
                <li>✓ Statistics Calculations (Percentages, Averages, Totals)</li>
                <li>✓ Clean Architecture (Domain, Application, Infrastructure, UI)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
