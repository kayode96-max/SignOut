import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Link as LinkIcon, 
  Settings, 
  Heart, 
  Users, 
  Copy, 
  ExternalLink,
  LogOut,
  Gift,
  Palette,
  MessageSquare,
  Download,
  Share2,
  Loader2
} from 'lucide-react'
import JSZip from 'jszip'
import { useAuth } from '../contexts/AuthContext'
import SignatureGallery from '../components/SignatureGallery'
import ThemeSettings from '../components/ThemeSettings'
import PopupSettings from '../components/PopupSettings'
import { database } from '../lib/supabase'

const Dashboard = () => {
  const { user, studentProfile, signOut } = useAuth()
  const [signatures, setSignatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [copySuccess, setCopySuccess] = useState(false)

  const shareUrl = `${window.location.origin}/sign/${user?.id}`

  useEffect(() => {
    const loadSignatures = async () => {
      try {
        console.log('Dashboard loading signatures for user:', user?.id)
        
        if (user?.id) {
          const { data, error } = await database.getSignatures(user.id)
          if (!error) {
            setSignatures(data || [])
          } else {
            console.error('Error loading signatures:', error)
          }
        } else {
          console.log('No user ID available for loading signatures')
          setSignatures([])
        }
      } catch (err) {
        console.error('Error loading signatures:', err)
        setSignatures([])
      } finally {
        setLoading(false)
      }
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Dashboard signatures loading timeout')
      setLoading(false)
    }, 5000)

    loadSignatures().finally(() => clearTimeout(timeoutId))
  }, [user])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${studentProfile?.name}'s Digital Sign-Out Page`,
          text: 'Sign my digital sign-out page and leave a message!',
          url: shareUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleExportAll = async () => {
    if (signatures.length === 0) return

    try {
      setExporting(true)
      const zip = new JSZip()

      // Create CSV content
      const csvHeader = ['Date', 'Name', 'Message', 'Signature File'].join(',')
      const csvRows = signatures.map(sig => {
        const date = new Date(sig.created_at).toLocaleString()
        const name = `"${sig.signatory_name.replace(/"/g, '""')}"`
        const message = sig.signatory_note ? `"${sig.signatory_note.replace(/"/g, '""')}"` : '""'
        const filename = `signature-${sig.id}.png`
        return [date, name, message, filename].join(',')
      })

      zip.file('messages.csv', [csvHeader, ...csvRows].join('\n'))

      // Create images folder
      const imgFolder = zip.folder("signatures")

      // Fetch and add images
      const imagePromises = signatures.map(async (sig) => {
        try {
          const response = await fetch(sig.signature_url)
          const blob = await response.blob()
          imgFolder.file(`signature-${sig.id}.png`, blob)
        } catch (err) {
          console.error(`Failed to fetch image for ${sig.id}:`, err)
        }
      })

      await Promise.all(imagePromises)

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' })
      const url = window.URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `sign-out-memories-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'signatures', label: 'Signatures', icon: Users },
    { id: 'cards', label: 'Thank You Cards', icon: Gift },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'popup', label: 'Thank You Message', icon: MessageSquare },
  ]

  const stats = [
    {
      label: 'Total Signatures',
      value: signatures.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'This Week',
      value: signatures.filter(s => {
        const signatureDate = new Date(s.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return signatureDate > weekAgo
      }).length,
      icon: Heart,
      color: 'bg-green-500'
    },
    {
      label: 'Thank You Cards',
      value: signatures.length, // Each signature generates a card
      icon: Gift,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {studentProfile?.name}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Share Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Page
              </motion.button>

              {/* Sign Out */}
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{studentProfile?.name}</h3>
                <p className="text-sm text-gray-600">{studentProfile?.email}</p>
              </div>

              {/* Quick Share */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Your Sign-Out Page
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-sm p-6"
                      >
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg ${stat.color}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Recent Signatures Preview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Signatures</h3>
                    <button
                      onClick={() => setActiveTab('signatures')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {signatures.slice(0, 5).map(signature => (
                        <div key={signature.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                          <img
                            src={signature.signature_url}
                            alt="Signature"
                            className="w-12 h-8 object-contain bg-gray-50 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{signature.signatory_name}</p>
                            {signature.signatory_note && (
                              <p className="text-sm text-gray-600 truncate">{signature.signatory_note}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(signature.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      
                      {signatures.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          No signatures yet. Share your page to get started!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'signatures' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">All Signatures</h3>
                  <button
                    onClick={handleExportAll}
                    disabled={exporting || signatures.length === 0}
                    className="flex items-center gap-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {exporting ? 'Exporting...' : 'Export All'}
                  </button>
                </div>
                <SignatureGallery 
                  studentId={user?.id}
                  showPrivateDetails={true}
                />
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thank You Cards</h3>
                <p className="text-gray-600 mb-6">
                  Automatically generated thank you cards for each signature. Customize and download them!
                </p>
                <button
                  onClick={() => window.location.href = '/thank-you-cards'}
                  className="btn-primary"
                >
                  Manage Cards →
                </button>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <ThemeSettings />
              </div>
            )}

            {activeTab === 'popup' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <PopupSettings />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard