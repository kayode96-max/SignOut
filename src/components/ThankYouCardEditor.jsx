import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Save, 
  Download, 
  Palette, 
  Type, 
  Sticker,
  Loader2,
  Gift,
  Heart,
  Star,
  Sparkles,
  Smile
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { database } from '../lib/supabase'

const ThankYouCardEditor = ({ isVisible, card, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [cardData, setCardData] = useState({
    background: '#ffffff',
    message: 'Thank you for signing my page!',
    decorations: []
  })
  const cardRef = useRef()

  const backgrounds = [
    { name: 'Pure White', value: '#ffffff' },
    { name: 'Soft Blue', value: '#f0f9ff' },
    { name: 'Light Pink', value: '#fdf2f8' },
    { name: 'Mint Green', value: '#f0fdf4' },
    { name: 'Warm Yellow', value: '#fffbeb' },
    { name: 'Lavender', value: '#f5f3ff' },
    { name: 'Peach', value: '#fff7ed' },
    { name: 'Rose', value: '#fff1f2' }
  ]

  const decorationIcons = [
    { icon: Heart, name: 'Heart', color: '#ef4444' },
    { icon: Star, name: 'Star', color: '#eab308' },
    { icon: Sparkles, name: 'Sparkles', color: '#8b5cf6' },
    { icon: Gift, name: 'Gift', color: '#10b981' },
    { icon: Smile, name: 'Smile', color: '#f59e0b' }
  ]

  useState(() => {
    if (card?.card_data) {
      setCardData(card.card_data)
    } else if (card) {
      setCardData({
        background: '#ffffff',
        message: `Thank you ${card.signatures?.signatory_name} for signing my page!`,
        decorations: []
      })
    }
  }, [card])

  const handleSave = async () => {
    if (!card) return

    setLoading(true)
    try {
      const { data, error } = await database.updateThankYouCard(card.id, {
        card_data: cardData
      })
      
      if (!error && data) {
        onSave(data[0])
        onClose()
      }
    } catch (err) {
      console.error('Error saving card:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return

    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        width: 800,
        height: 600,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '400px',
          height: '300px'
        }
      })

      const link = document.createElement('a')
      link.download = `thank-you-card-${card?.signatures?.signatory_name || 'card'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error downloading card:', err)
    } finally {
      setDownloading(false)
    }
  }

  const addDecoration = (decoration) => {
    const newDecoration = {
      id: Date.now(),
      ...decoration,
      x: Math.random() * 60 + 20, // Random position between 20-80%
      y: Math.random() * 40 + 20,
      size: 24
    }
    setCardData(prev => ({
      ...prev,
      decorations: [...prev.decorations, newDecoration]
    }))
  }

  const removeDecoration = (decorationId) => {
    setCardData(prev => ({
      ...prev,
      decorations: prev.decorations.filter(d => d.id !== decorationId)
    }))
  }

  if (!isVisible || !card) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Thank You Card</h3>
                <p className="text-sm text-gray-600">
                  For {card.signatures?.signatory_name}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Editor Panel */}
            <div className="space-y-6">
              {/* Message Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4 inline mr-2" />
                  Thank You Message
                </label>
                <textarea
                  value={cardData.message}
                  onChange={(e) => setCardData(prev => ({ ...prev, message: e.target.value }))}
                  className="input-field h-24 resize-none"
                  placeholder="Write your thank you message..."
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{cardData.message.length}/200</p>
              </div>

              {/* Background Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Background Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setCardData(prev => ({ ...prev, background: bg.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        cardData.background === bg.value
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: bg.value }}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-700 mt-1">
                          {bg.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Sticker className="w-4 h-4 inline mr-2" />
                  Add Decorations
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {decorationIcons.map((decoration) => {
                    const IconComponent = decoration.icon
                    return (
                      <button
                        key={decoration.name}
                        onClick={() => addDecoration(decoration)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        title={`Add ${decoration.name}`}
                      >
                        <IconComponent 
                          className="w-5 h-5 mx-auto" 
                          style={{ color: decoration.color }}
                        />
                      </button>
                    )
                  })}
                </div>
                
                {cardData.decorations.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Added decorations (click to remove):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cardData.decorations.map((decoration) => {
                        const IconComponent = decorationIcons.find(d => d.name === decoration.name)?.icon
                        return (
                          <button
                            key={decoration.id}
                            onClick={() => removeDecoration(decoration.id)}
                            className="p-2 bg-white rounded border hover:bg-red-50 hover:border-red-200 transition-colors"
                            title={`Remove ${decoration.name}`}
                          >
                            {IconComponent && (
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: decoration.color }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-secondary flex items-center gap-2"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download
                </motion.button>
              </div>
            </div>

            {/* Preview Panel */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
              <div className="bg-gray-100 p-6 rounded-xl">
                <div
                  ref={cardRef}
                  className="relative w-full aspect-4/3 rounded-lg shadow-lg overflow-hidden"
                  style={{ backgroundColor: cardData.background }}
                >
                  {/* Main Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-6">
                      <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Thank You!
                    </h3>
                    
                    <p className="text-gray-700 text-lg leading-relaxed max-w-xs">
                      {cardData.message}
                    </p>
                    
                    <div className="mt-6 text-sm text-gray-600">
                      - {card.signatures?.signatory_name} -
                    </div>
                  </div>

                  {/* Decorations */}
                  {cardData.decorations.map((decoration) => {
                    const IconComponent = decorationIcons.find(d => d.name === decoration.name)?.icon
                    return IconComponent ? (
                      <div
                        key={decoration.id}
                        className="absolute animate-pulse"
                        style={{
                          left: `${decoration.x}%`,
                          top: `${decoration.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <IconComponent
                          className="drop-shadow-sm"
                          style={{
                            width: decoration.size,
                            height: decoration.size,
                            color: decoration.color
                          }}
                        />
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ThankYouCardEditor