// src/app/test-typography/page.tsx - Typography System Test & Demo Page
'use client'

import { Heading, Text, Label, Badge, Caption } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function TestTypographyPage() {
  return (
    <div className="min-h-screen bg-cirfpro-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <Heading level="display" color="brand">Typography System</Heading>
          <Text size="lg" color="muted" className="mt-4">
            Complete CIRFPRO typography components with examples and migration guides
          </Text>
          <Badge variant="brand" size="lg" className="mt-4">✅ Ready for Migration</Badge>
        </div>

        {/* Heading Components */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Heading Components</CardTitle>
              <Text color="muted">All heading levels with consistent CIRFPRO styling</Text>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Display & H1-H6 Examples */}
              <div className="space-y-4">
                <div>
                  <Caption uppercase className="mb-2">Display Heading</Caption>
                  <Heading level="display">Welcome to CIRFPRO</Heading>
                  <code className="text-xs text-cirfpro-gray-500 block mt-1">
                    {'<Heading level="display">Welcome to CIRFPRO</Heading>'}
                  </code>
                </div>

                <div>
                  <Caption uppercase className="mb-2">H1 - Page Titles</Caption>
                  <Heading level="h1">Dashboard Overview</Heading>
                  <code className="text-xs text-cirfpro-gray-500 block mt-1">
                    {'<Heading level="h1">Dashboard Overview</Heading>'}
                  </code>
                </div>

                <div>
                  <Caption uppercase className="mb-2">H2 - Section Headings</Caption>
                  <Heading level="h2">Athlete Management</Heading>
                  <code className="text-xs text-cirfpro-gray-500 block mt-1">
                    {'<Heading level="h2">Athlete Management</Heading>'}
                  </code>
                </div>

                <div>
                  <Caption uppercase className="mb-2">H3 - Subsection Headings</Caption>
                  <Heading level="h3">Training Plans</Heading>
                  <code className="text-xs text-cirfpro-gray-500 block mt-1">
                    {'<Heading level="h3">Training Plans</Heading>'}
                  </code>
                </div>

                <div>
                  <Caption uppercase className="mb-2">H4 - Card Titles</Caption>
                  <Heading level="h4">Recent Activity</Heading>
                  <code className="text-xs text-cirfpro-gray-500 block mt-1">
                    {'<Heading level="h4">Recent Activity</Heading>'}
                  </code>
                </div>

                <div>
                  <Caption uppercase className="mb-2">H5 & H6 - Small Headings</Caption>
                  <Heading level="h5">Performance Metrics</Heading>
                  <Heading level="h6">Last Updated</Heading>
                  <code className="text-xs text-cirfpro-gray-500 block mt-1">
                    {'<Heading level="h5">Performance Metrics</Heading>'}
                  </code>
                </div>
              </div>

              {/* Color Variants */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Heading Color Variants</Caption>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Heading level="h3" color="default">Default Color</Heading>
                    <code className="text-xs text-cirfpro-gray-500">color=&quot;default&quot;</code>
                  </div>
                  <div>
                    <Heading level="h3" color="brand">Brand Color</Heading>
                    <code className="text-xs text-cirfpro-gray-500">color=&quot;brand&quot;</code>
                  </div>
                  <div>
                    <Heading level="h3" color="muted">Muted Color</Heading>
                    <code className="text-xs text-cirfpro-gray-500">color=&quot;muted&quot;</code>
                  </div>
                  <div>
                    <Heading level="h3" color="light">Light Color</Heading>
                    <code className="text-xs text-cirfpro-gray-500">color=&quot;light&quot;</code>
                  </div>
                  <div className="bg-cirfpro-gray-900 p-4 rounded">
                    <Heading level="h3" color="white">White Color</Heading>
                    <code className="text-xs text-cirfpro-gray-300">color=&quot;white&quot;</code>
                  </div>
                </div>
              </div>

              {/* Utility Sizes */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Utility Sizes (for Stats, etc.)</Caption>
                <div className="space-y-3">
                  <div>
                    <Heading level="2xl">1,234 Athletes</Heading>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Heading level="2xl">1,234 Athletes</Heading>'}</code>
                  </div>
                  <div>
                    <Heading level="xl">42 Pending Invites</Heading>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Heading level="xl">42 Pending Invites</Heading>'}</code>
                  </div>
                  <div>
                    <Heading level="lg">Active Sessions</Heading>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Heading level="lg">Active Sessions</Heading>'}</code>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Text Components */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Text Components</CardTitle>
              <Text color="muted">Body text, labels, and paragraph content</Text>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Text Sizes */}
              <div>
                <Caption uppercase className="mb-4">Text Sizes</Caption>
                <div className="space-y-3">
                  <div>
                    <Text size="xl">Extra large text for prominent content and introductions</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text size="xl">Extra large text...</Text>'}</code>
                  </div>
                  <div>
                    <Text size="lg">Large text for emphasized content and important messages</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text size="lg">Large text...</Text>'}</code>
                  </div>
                  <div>
                    <Text size="base">Base text size for regular body content and paragraphs. This is the default size.</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text size="base">Base text...</Text>'}</code>
                  </div>
                  <div>
                    <Text size="sm">Small text for secondary information and details</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text size="sm">Small text...</Text>'}</code>
                  </div>
                  <div>
                    <Text size="xs">Extra small text for fine print and captions</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text size="xs">Extra small text...</Text>'}</code>
                  </div>
                </div>
              </div>

              {/* Text Weights */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Text Weights</Caption>
                <div className="space-y-3">
                  <div>
                    <Text weight="normal">Normal weight text for regular content</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text weight="normal">Normal weight...</Text>'}</code>
                  </div>
                  <div>
                    <Text weight="medium">Medium weight text for slight emphasis</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text weight="medium">Medium weight...</Text>'}</code>
                  </div>
                  <div>
                    <Text weight="semibold">Semibold text for strong emphasis</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text weight="semibold">Semibold text...</Text>'}</code>
                  </div>
                  <div>
                    <Text weight="bold">Bold text for maximum emphasis</Text>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Text weight="bold">Bold text...</Text>'}</code>
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Text Colors</Caption>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Text color="default">Default text color</Text>
                    <Text color="muted">Muted text color</Text>
                    <Text color="light">Light text color</Text>
                    <Text color="dark">Dark text color</Text>
                    <Text color="brand">Brand text color</Text>
                  </div>
                  <div className="space-y-2">
                    <Text color="success">Success message text</Text>
                    <Text color="warning">Warning message text</Text>
                    <Text color="error">Error message text</Text>
                    <Text color="info">Information text</Text>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Badge Components */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Badge Components</CardTitle>
              <Text color="muted">Status indicators and tags</Text>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Badge Variants */}
              <div>
                <Caption uppercase className="mb-4">Badge Variants</Caption>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="brand">CIRFPRO</Badge>
                  <Badge variant="success">Active</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="error">Expired</Badge>
                  <Badge variant="info">Information</Badge>
                </div>
                <code className="text-xs text-cirfpro-gray-500 block mt-2">
                  {'<Badge variant="success">Active</Badge>'}
                </code>
              </div>

              {/* Badge Sizes */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Badge Sizes</Caption>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="brand" size="sm">Small</Badge>
                  <Badge variant="brand" size="base">Default</Badge>
                  <Badge variant="brand" size="lg">Large</Badge>
                </div>
                <code className="text-xs text-cirfpro-gray-500 block mt-2">
                  {'<Badge variant="brand" size="lg">Large</Badge>'}
                </code>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Form Typography</CardTitle>
              <Text color="muted">Labels and form-related text components</Text>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Form Labels */}
              <div>
                <Caption uppercase className="mb-4">Form Labels</Caption>
                <div className="space-y-4">
                  <div>
                    <Label size="base">Email Address</Label>
                    <input 
                      type="email" 
                      className="w-full mt-1 px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-cirfpro-green-500" 
                      placeholder="coach@example.com"
                    />
                  </div>
                  <div>
                    <Label size="base" required>Password (Required)</Label>
                    <input 
                      type="password" 
                      className="w-full mt-1 px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-cirfpro-green-500" 
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label size="sm">Optional Information</Label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-cirfpro-green-500" 
                      placeholder="Optional field"
                    />
                  </div>
                </div>
                <code className="text-xs text-cirfpro-gray-500 block mt-4">
                  {'<Label required>Password (Required)</Label>'}
                </code>
              </div>

              {/* Caption Examples */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Caption Components</Caption>
                <div className="space-y-3">
                  <div>
                    <Caption>Regular caption text</Caption>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Caption>Regular caption text</Caption>'}</code>
                  </div>
                  <div>
                    <Caption uppercase>Uppercase caption</Caption>
                    <code className="text-xs text-cirfpro-gray-500 block">{'<Caption uppercase>Uppercase caption</Caption>'}</code>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Migration Examples */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Migration Examples</CardTitle>
              <Text color="muted">Before and after examples for your current codebase</Text>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* StatCard Migration */}
              <div>
                <Caption uppercase className="mb-4">StatCard Typography Migration</Caption>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div>
                    <Heading level="h5" className="mb-2">❌ Before (Hardcoded)</Heading>
                    <div className="bg-cirfpro-gray-100 p-4 rounded-lg">
                      <pre className="text-xs text-cirfpro-gray-700 whitespace-pre-wrap">
{`<div className="text-xs font-medium text-gray-600 uppercase">
  Total Athletes
</div>
<div className="text-2xl font-bold text-gray-900">
  {stats.total_athletes}
</div>`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <Heading level="h5" className="mb-2">✅ After (Components)</Heading>
                    <div className="bg-cirfpro-green-50 p-4 rounded-lg">
                      <pre className="text-xs text-cirfpro-gray-700 whitespace-pre-wrap">
{`<Caption uppercase color="muted">
  Total Athletes
</Caption>
<Heading level="2xl">
  {stats.total_athletes}
</Heading>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Migration */}
              <div className="border-t pt-6">
                <Caption uppercase className="mb-4">Form Typography Migration</Caption>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div>
                    <Heading level="h5" className="mb-2">❌ Before (Hardcoded)</Heading>
                    <div className="bg-cirfpro-gray-100 p-4 rounded-lg">
                      <pre className="text-xs text-cirfpro-gray-700 whitespace-pre-wrap">
{`<label className="text-sm font-medium text-gray-700">
  Email Address *
</label>
<p className="text-xs text-gray-500 mt-1">
  We'll use this for login
</p>`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <Heading level="h5" className="mb-2">✅ After (Components)</Heading>
                    <div className="bg-cirfpro-green-50 p-4 rounded-lg">
                      <pre className="text-xs text-cirfpro-gray-700 whitespace-pre-wrap">
{`<Label required>
  Email Address
</Label>
<Caption className="mt-1">
  We'll use this for login
</Caption>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Real Usage Example */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Real Component Example</CardTitle>
              <Text color="muted">A complete stat card using the new typography system</Text>
            </CardHeader>
            <CardContent>
              
              {/* Example StatCard with new typography */}
              <div className="bg-white border border-cirfpro-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-cirfpro-green-100 rounded-lg">
                    <span className="text-cirfpro-green-600 text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <Caption uppercase color="muted">Total Athletes</Caption>
                    <div className="flex items-center gap-2 mt-1">
                      <Heading level="2xl">1,247</Heading>
                      <Badge variant="success" size="sm">+12%</Badge>
                    </div>
                    <Text size="xs" color="light" className="mt-1">vs last month</Text>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-cirfpro-gray-50 p-4 rounded-lg">
                <Caption uppercase className="mb-2">Complete code example:</Caption>
                <pre className="text-xs text-cirfpro-gray-700 whitespace-pre-wrap">
{`<div className="bg-white border border-cirfpro-gray-200 rounded-lg p-6 shadow-sm">
  <div className="flex items-center">
    <div className="p-3 bg-cirfpro-green-100 rounded-lg">
      <span className="text-cirfpro-green-600 text-xl">👥</span>
    </div>
    <div className="ml-4">
      <Caption uppercase color="muted">Total Athletes</Caption>
      <div className="flex items-center gap-2 mt-1">
        <Heading level="2xl">1,247</Heading>
        <Badge variant="success" size="sm">+12%</Badge>
      </div>
      <Text size="xs" color="light" className="mt-1">vs last month</Text>
    </div>
  </div>
</div>`}
                </pre>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <Text color="muted">
            Typography system ready for implementation across CIRFPRO application
          </Text>
          <Badge variant="brand" className="mt-2">🚀 Ready to Deploy</Badge>
        </div>

      </div>
    </div>
  )
}