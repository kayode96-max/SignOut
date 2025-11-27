import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ThemeSettings = () => {
  const { studentProfile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('gradient-blue')

  const themes = [
    {
      id: 'gradient-blue',
      name: 'Ocean Blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Calm and professional ocean vibes'
    },
    {
      id: 'gradient-purple',
      name: 'Sunset Purple',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Vibrant and energetic sunset colors'
    },
    {
      id: 'gradient-green',
      name: 'Fresh Mint',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Fresh and modern mint tones'
    },
    {
      id: 'gradient-orange',
      name: 'Warm Sunset',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Warm and welcoming sunset hues'
    },
    {
      id: 'gradient-dark',
      name: 'Night Sky',
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      description: 'Elegant dark theme'
    },
    {
      id: 'gradient-rainbow',
      name: 'Celebration',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      description: 'Joyful celebration colors'
    }
  ]

  useEffect(() => {
    if (studentProfile?.theme?.background) {
      setSelectedTheme(studentProfile.theme.background)
    }
  }, [studentProfile])

  const handleThemeChange = async (themeId) => {
    setLoading(true)
    setMessage('')
    
    try {
      const currentTheme = studentProfile?.theme || {}
      const updatedTheme = {
        ...currentTheme,
        background: themeId
      }

      const { error } = await updateProfile({ theme: updatedTheme })
      
      if (error) {
        setMessage('Failed to update theme')
      } else {
        setSelectedTheme(themeId)
        setMessage('Theme updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setMessage('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <Palette className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Page Theme</h3>
          <p className="text-sm text-gray-600">Customize the background of your sign-out page</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleThemeChange(theme.id)}
            disabled={loading}
            className={`relative overflow-hidden rounded-xl border-2 transition-all ${
              selectedTheme === theme.id
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-gray-200 hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Theme Preview */}
            <div
              className="h-24 w-full"
              style={{ background: theme.gradient }}
            />
            
            {/* Theme Info */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{theme.name}</h4>
                {selectedTheme === theme.id && (
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-left">{theme.description}</p>
            </div>

            {/* Loading Overlay */}
            {loading && selectedTheme === theme.id && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Preview Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40">
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ 
              background: themes.find(t => t.id === selectedTheme)?.gradient 
            }}
          >
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{studentProfile?.name}'s Sign-Out Page</h3>
              <p className="text-white/90">Leave your signature and a message! 🎓</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-2">Pro Tip</h5>
        <p className="text-sm text-gray-600">
          Choose a theme that reflects your personality! Your friends will see this background when they visit your sign-out page.
        </p>
      </div>
    </div>
  )
}

export default ThemeSettings