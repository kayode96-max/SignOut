import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Gift, 
  Edit3, 
  Download, 
  DownloadCloud,
  Loader2,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import ThankYouCardEditor from '../components/ThankYouCardEditor'
import { Link } from 'react-router-dom'

const ThankYouCards = () => {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)

  useEffect(() => {
    const loadCards = async () => {
      if (user) {
        try {
          const { data, error } = await database.getThankYouCards(user.id)
          if (!error) {
            setCards(data || [])
          }
        } catch (err) {
          console.error('Error loading cards:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    loadCards()
  }, [user])

  const handleEditCard = (card) => {
    setSelectedCard(card)
    setShowEditor(true)
  }

  const handleCardUpdated = (updatedCard) => {
    setCards(prev => 
      prev.map(card => 
        card.id === updatedCard.id ? { ...card, ...updatedCard } : card
      )
    )
  }

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    try {
      // This would implement bulk download functionality
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Downloading all cards...')
    } finally {
      setDownloadingAll(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading thank you cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="w-px h-8 bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Thank You Cards</h1>
                  <p className="text-gray-600">{cards.length} cards generated</p>
                </div>
              </div>
            </div>
            
            {cards.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {downloadingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DownloadCloud className="w-4 h-4" />
                )}
                Download All
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Thank You Cards Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thank you cards are automatically generated when people sign your page. 
              Share your link to start collecting signatures and cards!
            </p>
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center gap-2"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Automatically Generated Cards</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Each signature on your page generates a personalized thank you card. 
                    You can customize, preview, and download individual cards or all cards at once.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Card Preview */}
                    <div 
                      className="aspect-4/3 p-6 flex flex-col items-center justify-center text-center"
                      style={{ 
                        backgroundColor: card.card_data?.background || '#ffffff'
                      }}
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 opacity-80">
                        <Gift className="w-6 h-6 text-pink-500" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thank You
                      </h4>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {card.card_data?.message || `Thank you ${card.signatures?.signatory_name} for signing my page!`}
                      </p>
                    </div>

                    {/* Card Info */}
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900 truncate">
                            {card.signatures?.signatory_name}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {new Date(card.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCard(card)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => {/* Handle individual download */}}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all pointer-events-none" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bulk Actions */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                  className="btn-primary flex items-center gap-2"
                >
                  {downloadingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="w-4 h-4" />
                  )}
                  Download All as ZIP
                </button>
                
                <button className="btn-secondary flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview All
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Export all your thank you cards at once, or preview them in a slideshow format.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Card Editor Modal */}
      <ThankYouCardEditor
        isVisible={showEditor}
        card={selectedCard}
        onClose={() => {
          setShowEditor(false)
          setSelectedCard(null)
        }}
        onSave={handleCardUpdated}
      />
    </div>
  )
}

export default ThankYouCards