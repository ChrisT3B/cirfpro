// Create: src/app/test-cards/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

export default function CardTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-cirfpro-gray-900">Card Component Test</h1>
      
      {/* Test all card variants */}
      <div className="space-y-8">
        
        {/* Basic Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">Basic Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard shadow and styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This replaces your basic bg-white rounded-lg shadow cards</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Larger shadow for importance</CardDescription>
              </CardHeader>
              <CardContent>
                <p>For hero cards and important content</p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover effects and cursor pointer</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Try hovering over this card!</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Accent Cards (for stats) */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">Accent Cards (Your Stats Cards)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <Card variant="accent" accentColor="blue" padding="sm">
              <div className="text-xs font-medium text-gray-600 uppercase">Pending</div>
              <div className="mt-1 text-2xl font-bold text-blue-600">42</div>
            </Card>

            <Card variant="accent" accentColor="cirfpro-green" padding="sm">
              <div className="text-xs font-medium text-gray-600 uppercase">Accepted</div>
              <div className="mt-1 text-2xl font-bold text-cirfpro-green-600">128</div>
            </Card>

            <Card variant="accent" accentColor="red" padding="sm">
              <div className="text-xs font-medium text-gray-600 uppercase">Expired</div>
              <div className="mt-1 text-2xl font-bold text-red-600">5</div>
            </Card>

            <Card variant="accent" accentColor="gray" padding="sm">
              <div className="text-xs font-medium text-gray-600 uppercase">Total</div>
              <div className="mt-1 text-2xl font-bold text-cirfpro-gray-600">175</div>
            </Card>

          </div>
        </section>

        {/* Dashboard-style Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">Dashboard Style Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Athletes</p>
                  <p className="text-2xl font-semibold text-gray-900">1,234</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-cirfpro-green-100 rounded-lg">
                  <span className="text-cirfpro-green-600 text-xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Athletes</p>
                  <p className="text-2xl font-semibold text-gray-900">892</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-yellow-600 text-xl">📧</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                  <p className="text-2xl font-semibold text-gray-900">42</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-xl">🏃</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </Card>

          </div>
        </section>

        {/* Padding Variants */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">Padding Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <Card padding="sm">
              <CardTitle>Small Padding (p-4)</CardTitle>
              <CardContent>
                <p>Used for compact stat cards</p>
              </CardContent>
            </Card>

            <Card padding="default">
              <CardTitle>Default Padding (p-6)</CardTitle>
              <CardContent>
                <p>Most dashboard cards use this</p>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardTitle>Large Padding (p-8)</CardTitle>
              <CardContent>
                <p>For hero sections and feature cards</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Content Structure Examples */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">Structured Content</h2>
          
          <Card variant="elevated" className="max-w-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your coaching workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full bg-cirfpro-green-600 text-white px-4 py-2 rounded-lg hover:bg-cirfpro-green-700 transition-colors">
                📧 Invite Athlete
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                👥 Manage Athletes
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                📋 Training Plans
              </button>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-cirfpro-gray-500">Last updated: 2 minutes ago</p>
            </CardFooter>
          </Card>

        </section>

        {/* StatCard Component Tests */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">StatCard Component (Dashboard Variant)</h2>
          <p className="text-cirfpro-gray-600 mb-4">These replace your current dashboard stat cards with a single component call!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <StatCard
              icon="👥"
              label="Total Athletes"
              value={1234}
              color="blue"
              variant="dashboard"
            />

            <StatCard
              icon="⚡"
              label="Active Athletes"
              value={892}
              color="cirfpro-green"
              variant="dashboard"
              trend={{ value: 12, direction: 'up', period: 'vs last month' }}
            />

            <StatCard
              icon="📧"
              label="Pending Invites"
              value={42}
              color="yellow"
              variant="dashboard"
              subtitle="5 expire soon"
            />

            <StatCard
              icon="🏃"
              label="This Week Sessions"
              value={156}
              color="purple"
              variant="dashboard"
              trend={{ value: 8, direction: 'down', period: 'vs last week' }}
            />

          </div>

          <div className="bg-cirfpro-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Before (4 separate divs):</h4>
            <code className="text-xs block mb-2">
              {`<div className="bg-white p-6 rounded-lg shadow">
  <div className="flex items-center">
    <div className="p-2 bg-blue-100 rounded-lg">
      <span className="text-blue-600 text-xl">👥</span>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">Total Athletes</p>
      <p className="text-2xl font-semibold text-gray-900">{stats.total_athletes}</p>
    </div>
  </div>
</div>`}
            </code>
            <h4 className="font-semibold mb-2">After (1 component):</h4>
            <code className="text-xs">
              {`<StatCard icon="👥" label="Total Athletes" value={stats.total_athletes} color="blue" />`}
            </code>
          </div>
        </section>

        {/* StatCard Invitation Variant */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">StatCard Component (Invitation Variant)</h2>
          <p className="text-cirfpro-gray-600 mb-4">These replace your 7 invitation stat cards!</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            
            <StatCard
              label="Total"
              value={175}
              color="gray"
              variant="invitation"
            />

            <StatCard
              label="Pending"
              value={42}
              color="blue"
              variant="invitation"
              trend={{ value: 5, direction: 'up' }}
            />

            <StatCard
              label="Accepted"
              value={128}
              color="cirfpro-green"
              variant="invitation"
            />

            <StatCard
              label="Expired"
              value={5}
              color="red"
              variant="invitation"
            />

            <StatCard
              label="Declined"
              value={3}
              color="gray"
              variant="invitation"
            />

            <StatCard
              label="Cancelled"
              value={2}
              color="gray"
              variant="invitation"
            />

            <StatCard
              label="This Month"
              value={23}
              color="purple"
              variant="invitation"
              subtitle="New invites"
            />

          </div>

          <div className="bg-cirfpro-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Before (7 separate divs):</h4>
            <code className="text-xs block mb-2">
              {`<div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
  <div className="text-xs font-medium text-gray-600 uppercase">Pending</div>
  <div className="mt-1 text-2xl font-bold text-blue-600">{stats.pending}</div>
</div>`}
            </code>
            <h4 className="font-semibold mb-2">After (1 component):</h4>
            <code className="text-xs">
              {`<StatCard label="Pending" value={stats.pending} color="blue" variant="invitation" />`}
            </code>
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-cirfpro-gray-700">Loading States</h2>
          <p className="text-cirfpro-gray-600 mb-4">Built-in loading skeletons for both variants</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-2">Dashboard Loading</h4>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Loading..."
                  value={0}
                  loading={true}
                  variant="dashboard"
                />
                <StatCard
                  label="Loading..."
                  value={0}
                  loading={true}
                  variant="dashboard"
                />
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Invitation Loading</h4>
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="Loading..."
                  value={0}
                  loading={true}
                  variant="invitation"
                />
                <StatCard
                  label="Loading..."
                  value={0}
                  loading={true}
                  variant="invitation"
                />
                <StatCard
                  label="Loading..."
                  value={0}
                  loading={true}
                  variant="invitation"
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}