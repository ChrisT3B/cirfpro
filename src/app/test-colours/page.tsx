// Create this as a temporary test file: src/app/test-colors/page.tsx
export default function ColorTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">CIRFPRO Color Test</h1>
      
      {/* Test if basic colors work */}
      <div className="space-y-2">
        <div className="w-20 h-20 bg-red-500">Red 500 (should work)</div>
        <div className="w-20 h-20 bg-blue-500">Blue 500 (should work)</div>
      </div>
      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded transition-colors">
  Simple Hover Test
</button>
      {/* Test if CIRFPRO colors work */}
      <div className="space-y-2">
        <div className="w-20 h-20 bg-cirfpro-green-500">CIRFPRO Green 500</div>
        <div className="w-20 h-20 bg-cirfpro-green-600">CIRFPRO Green 600</div>
        <div className="w-20 h-20 bg-cirfpro-green-700">CIRFPRO Green 700</div>
      </div>
      
      {/* Test gradients */}
      <div className="space-y-2">
        <div className="w-40 h-20 bg-gradient-to-r from-red-500 to-blue-500">Standard gradient</div>
        <div className="w-40 h-20 bg-gradient-to-r from-cirfpro-green-600 to-cirfpro-green-700">CIRFPRO gradient</div>
      </div>
      
      {/* Test button with fallback colors */}
      <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded hover:from-green-700 hover:to-green-800 transition-all">
        Fallback Button (should have hover)
      </button>
    </div>
    
  )
}