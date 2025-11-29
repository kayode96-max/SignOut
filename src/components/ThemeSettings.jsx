import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, Check, Loader2, Save, Upload, User, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { storage } from '../lib/supabase'

const ThemeSettings = () => {
  const { studentProfile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('gradient-blue')

  // New state for profile customization
  const [introMessage, setIntroMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profilePreview, setProfilePreview] = useState(null)

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
    if (studentProfile?.theme) {
      if (studentProfile.theme.background) {
        setSelectedTheme(studentProfile.theme.background)
      }
      if (studentProfile.theme.introMessage) {
        setIntroMessage(studentProfile.theme.introMessage)
      }
    }
    if (studentProfile?.profile_pic) {
      setProfilePreview(studentProfile.profile_pic)
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

  const handleIntroMessageSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const currentTheme = studentProfile?.theme || {}
      const updatedTheme = {
        ...currentTheme,
        introMessage: introMessage
      }

      const { error } = await updateProfile({ theme: updatedTheme })

      if (error) {
        setMessage('Failed to update intro message')
      } else {
        setMessage('Intro message saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setMessage('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be less than 2MB')
      return
    }

    setUploadingImage(true)
    setMessage('')

    try {
      // 1. Upload image to storage
      // Using 'avatars' folder in 'signatures' bucket
      const fileExt = file.name.split('.').pop()
      const fileName = `avatars/${studentProfile.id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await storage.uploadSignature(file, fileName)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const publicUrl = storage.getSignatureUrl(fileName)

      // 3. Update profile
      const { error: updateError } = await updateProfile({ profile_pic: publicUrl })

      if (updateError) throw updateError

      setProfilePreview(publicUrl)
      setMessage('Profile picture updated!')
      setTimeout(() => setMessage(''), 3000)

    } catch (err) {
      console.error('Upload error:', err)
      setMessage('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <Palette className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Page Customization</h3>
          <p className="text-sm text-gray-600">Personalize your sign-out page appearance</p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.includes('success') || message.includes('updated')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Profile Picture & Intro Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Picture */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Profile Picture
          </h4>

          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            <label className="btn-secondary cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Max 2MB. JPG, PNG or WEBP.</p>
          </div>
        </div>

        {/* Intro Message */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Intro Message
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                This message appears at the top of your sign-out page.
              </label>
              <textarea
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                placeholder="Leave your signature and a message to wish me well on my next journey! 🎓"
                className="input-field h-32 resize-none"
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{introMessage.length}/200</span>
              </div>
            </div>

            <button
              onClick={handleIntroMessageSave}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Message
            </button>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color Theme
        </h4>
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
      </div>

      {/* Preview Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Live Preview</h4>
        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-64">
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 transition-colors duration-500"
            style={{ 
              background: themes.find(t => t.id === selectedTheme)?.gradient 
            }}
          >
            {profilePreview && (
              <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg mb-4 overflow-hidden">
                <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-center text-white max-w-lg">
              <h3 className="text-2xl font-bold mb-2 shadow-sm">{studentProfile?.name}'s Sign-Out Page</h3>
              <p className="text-white/90 text-lg shadow-sm">
                {introMessage || "Leave your signature and a message to wish me well on my next journey! 🎓"}
              </p>
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