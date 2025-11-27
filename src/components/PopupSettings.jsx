import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Heart, Sparkles, Save, Loader2, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ThankYouPopup from './ThankYouPopup'

const PopupSettings = () => {
  const { studentProfile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [config, setConfig] = useState({
    title: 'Thank You! 🎓',
    message: 'Thank you for signing my digital sign-out page! Your support means the world to me.',
    backgroundColor: '#f0f9ff',
    showConfetti: true
  })

  useEffect(() => {
    if (studentProfile?.popup_config) {
      setConfig(studentProfile.popup_config)
    }
  }, [studentProfile])

  const backgroundOptions = [
    { value: '#f0f9ff', label: 'Light Blue', color: '#f0f9ff' },
    { value: '#fdf2f8', label: 'Light Pink', color: '#fdf2f8' },
    { value: '#f0fdf4', label: 'Light Green', color: '#f0fdf4' },
    { value: '#fffbeb', label: 'Light Yellow', color: '#fffbeb' },
    { value: '#f5f3ff', label: 'Light Purple', color: '#f5f3ff' },
    { value: '#ffffff', label: 'Pure White', color: '#ffffff' },
  ]

  const predefinedMessages = [
    "Thank you for signing my digital sign-out page! Your support means the world to me.",
    "I'm grateful for your friendship and all the memories we've shared! 🎓",
    "Thank you for being part of my journey. Here's to new adventures ahead! ✨",
    "Your signature made my day! Thanks for celebrating this milestone with me.",
    "Grateful for your love and support as I embark on this new chapter! 💙"
  ]

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await updateProfile({ popup_config: config })
      
      if (error) {
        setMessage('Failed to update settings')
      } else {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setMessage('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Thank You Message</h3>
          <p className="text-sm text-gray-600">Customize the popup shown after someone signs your page</p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="popup-title" className="block text-sm font-medium text-gray-700 mb-2">
              Popup Title
            </label>
            <input
              id="popup-title"
              type="text"
              value={config.title}
              onChange={(e) => handleConfigChange('title', e.target.value)}
              className="input-field"
              placeholder="Thank You! 🎓"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{config.title.length}/50 characters</p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="popup-message" className="block text-sm font-medium text-gray-700 mb-2">
              Thank You Message
            </label>
            <textarea
              id="popup-message"
              value={config.message}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              className="input-field h-32 resize-none"
              placeholder="Write a heartfelt message..."
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">{config.message.length}/300 characters</p>
          </div>

          {/* Quick Messages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Messages
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {predefinedMessages.map((predefinedMessage, index) => (
                <button
                  key={index}
                  onClick={() => handleConfigChange('message', predefinedMessage)}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  "{predefinedMessage}"
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {backgroundOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('backgroundColor', option.value)}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    config.backgroundColor === option.value
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: option.color }}
                >
                  <div className="text-center">
                    <div className="w-6 h-6 rounded-full mx-auto mb-1 border border-gray-300" 
                         style={{ backgroundColor: option.color }} />
                    <span className="text-xs font-medium text-gray-700">{option.label}</span>
                  </div>
                  {config.backgroundColor === option.value && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Confetti Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <div>
                <h5 className="font-medium text-gray-900">Confetti Animation</h5>
                <p className="text-sm text-gray-600">Show falling confetti when popup appears</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showConfetti}
                onChange={(e) => handleConfigChange('showConfetti', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
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
              onClick={() => setShowPreview(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </motion.button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Live Preview
          </h4>
          
          <div className="relative">
            <div 
              className="rounded-xl p-6 border border-gray-200 min-h-[200px] flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: config.backgroundColor }}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {config.title}
              </h3>
              
              <p className="text-gray-700 leading-relaxed">
                {config.message}
              </p>

              {config.showConfetti && (
                <div className="mt-4 flex items-center gap-2 text-yellow-500 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>+ Confetti Animation</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            This is how your thank you message will appear to signers
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      <ThankYouPopup
        isVisible={showPreview}
        config={config}
        onClose={() => setShowPreview(false)}
      />
    </div>
  )
}

export default PopupSettings