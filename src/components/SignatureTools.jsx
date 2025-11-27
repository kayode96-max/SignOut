import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Pen, 
  Type, 
  Undo2, 
  Redo2, 
  Eraser, 
  Palette,
  Minus,
  Plus
} from 'lucide-react'

const SignatureTools = ({
  selectedTool,
  onToolChange,
  strokeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const colors = [
    '#000000', // Black
    '#2563eb', // Blue
    '#dc2626', // Red
    '#16a34a', // Green
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#be123c', // Rose
  ]

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'text', icon: Type, label: 'Text' },
  ]

  const strokeWidths = [1, 2, 3, 4, 6, 8]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Tools:</span>
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <motion.button
                key={tool.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolChange(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={tool.label}
              >
                <IconComponent className="w-5 h-5" />
              </motion.button>
            )
          })}
        </div>

        {/* Stroke Width */}
        {selectedTool === 'pen' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Width:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onStrokeWidthChange(Math.max(1, strokeWidth - 1))}
                className="p-1 rounded text-gray-600 hover:bg-gray-100"
                disabled={strokeWidth <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="flex gap-1">
                {strokeWidths.map((width) => (
                  <button
                    key={width}
                    onClick={() => onStrokeWidthChange(width)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      strokeWidth === width
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={`${width}px`}
                  >
                    <div
                      className="rounded-full bg-current"
                      style={{
                        width: Math.max(2, width),
                        height: Math.max(2, width),
                      }}
                    />
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => onStrokeWidthChange(Math.min(10, strokeWidth + 1))}
                className="p-1 rounded text-gray-600 hover:bg-gray-100"
                disabled={strokeWidth >= 10}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Color Picker */}
        <div className="relative flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
              style={{ backgroundColor: strokeColor }}
            >
              <Palette className="w-5 h-5 text-white drop-shadow-sm" />
            </button>
            
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-12 left-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
              >
                <div className="grid grid-cols-4 gap-2 w-32">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onColorChange(color)
                        setShowColorPicker(false)
                      }}
                      className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 ${
                        strokeColor === color
                          ? 'border-gray-800 ring-2 ring-gray-300'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
            title="Clear all"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Click outside to close color picker */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowColorPicker(false)}
        />
      )}
    </div>
  )
}

export default SignatureTools