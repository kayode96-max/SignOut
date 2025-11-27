import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Check, X } from 'lucide-react'

const TextSignatureInput = ({ 
  isVisible, 
  onAdd, 
  onCancel, 
  strokeColor,
  position = { x: 100, y: 100 } 
}) => {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Dancing Script')

  const fontOptions = [
    { name: 'Dancing Script', value: 'Dancing Script', style: 'cursive' },
    { name: 'Pacifico', value: 'Pacifico', style: 'cursive' },
    { name: 'Great Vibes', value: 'Great Vibes', style: 'cursive' },
    { name: 'Satisfy', value: 'Satisfy', style: 'cursive' },
    { name: 'Allura', value: 'Allura', style: 'cursive' },
    { name: 'Alex Brush', value: 'Alex Brush', style: 'cursive' },
    { name: 'Sacramento', value: 'Sacramento', style: 'cursive' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onAdd({
        text: text.trim(),
        x: position.x,
        y: position.y,
        fontSize,
        fontFamily,
        color: strokeColor
      })
      setText('')
      setFontSize(24)
      setFontFamily('Dancing Script')
    }
  }

  const handleCancel = () => {
    setText('')
    setFontSize(24)
    setFontFamily('Dancing Script')
    onCancel()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add Text Signature</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signature-text" className="block text-sm font-medium text-gray-700 mb-2">
                Your Signature Text
              </label>
              <input
                id="signature-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your name or message"
                className="input-field"
                autoFocus
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{text.length}/50 characters</p>
            </div>

            <div>
              <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <select
                id="font-family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="input-field"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-2">
                Size: {fontSize}px
              </label>
              <input
                id="font-size"
                type="range"
                min="16"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Preview */}
            {text && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div 
                  className="text-center"
                  style={{ 
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: strokeColor,
                    lineHeight: 1.2
                  }}
                >
                  {text}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!text.trim()}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Add Signature
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TextSignatureInput