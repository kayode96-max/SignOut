import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, User, MessageSquare, ExternalLink, Heart } from 'lucide-react'
import CanvasBoard from '../components/CanvasBoard'
import SignatureTools from '../components/SignatureTools'
import TextSignatureInput from '../components/TextSignatureInput'
import SignatureGallery from '../components/SignatureGallery'
import ThankYouPopup from '../components/ThankYouPopup'
import { database, storage, supabase } from '../lib/supabase'

const SigningPage = () => {
  const { studentId } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)

  // Signature form state
  const [signatoryName, setSignatoryName] = useState('')
  const [signatoryNote, setSignatoryNote] = useState('')

  // Canvas state
  const [selectedTool, setSelectedTool] = useState('pen')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [textSignatures, setTextSignatures] = useState([])
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInputPosition, setTextInputPosition] = useState({ x: 100, y: 100 })
  const [canvasActions, setCanvasActions] = useState(null)

  const canvasRef = useRef()

  // Load student profile
  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) {
        setLoading(false)
        setError('No student ID provided')
        return
      }

      try {
        setLoading(true)
        setError('')
        
        console.log('Loading student profile for ID:', studentId)
        const { data, error: fetchError } = await database.getStudentProfile(studentId)
        console.log('Student profile result:', { data, error: fetchError })
        
        if (fetchError || !data) {
          setError('Student not found. Please check the link and try again.')
          setStudent(null)
        } else {
          setStudent(data)
        }
      } catch (err) {
        console.error('Error loading student:', err)
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    loadStudent()
  }, [studentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!signatoryName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!canvasActions || canvasActions.isEmpty) {
      setError('Please add your signature')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Save signature to Supabase database
      console.log('Saving signature for student:', studentId)
      // Export signature as blob
      const blob = await canvasActions.exportAsBlob()
      if (!blob) {
        throw new Error('Failed to export signature')
      }

      // Generate unique filename
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.png`

      // Upload to Supabase Storage
      console.log('Uploading signature to storage...')
      const { data: uploadData, error: uploadError } = await storage.uploadSignature(blob, fileName)
      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`Failed to upload signature: ${uploadError.message}`)
      }

      // Get public URL
      const signatureUrl = storage.getSignatureUrl(fileName)
      console.log('Signature uploaded, URL:', signatureUrl)

      // Create signature record with explicit field validation
      const signatureData = {
        student_id: studentId,
        signature_url: signatureUrl,
        signatory_name: signatoryName.trim(),
        signatory_note: signatoryNote.trim() || null
      }

      // Validate required fields
      if (!signatureData.student_id || !signatureData.signature_url || !signatureData.signatory_name) {
        throw new Error('Missing required signature data')
      }

      console.log('Creating signature record with data:', signatureData)
      const { data, error: createError } = await database.createSignature(signatureData)
      console.log('Signature creation result:', { data, error: createError })
      
      if (createError) {
        console.error('Database error details:', createError)
        throw new Error(`Failed to save signature: ${createError.message}`)
      }
      
      console.log('Signature saved successfully:', data)

      // Clear form and canvas
      setSignatoryName('')
      setSignatoryNote('')
      setTextSignatures([])
      canvasActions?.clear()

      // Show thank you popup
      setShowThankYou(true)
    } catch (err) {
      setError(err.message || 'Failed to submit signature')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddTextSignature = (textData) => {
    setTextSignatures(prev => [...prev, textData])
    setShowTextInput(false)
  }

  const handleTextToolClick = (x, y) => {
    setTextInputPosition({ x, y })
    setShowTextInput(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading sign-out page...</p>
        </div>
      </div>
    )
  }

  if (error && !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <User className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const theme = student?.theme || {}
  const backgroundClass = theme.background === 'gradient-blue' 
    ? 'bg-gradient-blue' 
    : theme.background === 'gradient-purple'
    ? 'bg-gradient-purple'
    : theme.background === 'gradient-green'
    ? 'bg-gradient-green'
    : 'bg-gradient-blue'

  return (
    <div key={studentId} className={`min-h-screen ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {student?.profile_pic && (
            <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/30 shadow-lg overflow-hidden">
              <img
                src={student.profile_pic}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {student?.name}'s Sign-Out Page
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            {student?.theme?.introMessage || "Leave your signature and a message to wish me well on my next journey! 🎓"}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>Digital Memories</span>
            </div>
            <div className="w-1 h-1 bg-white/60 rounded-full" />
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>Forever Grateful</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Signature Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                Sign My Page
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      id="note"
                      value={signatoryNote}
                      onChange={(e) => setSignatoryNote(e.target.value)}
                      className="input-field pl-10 h-24 resize-none"
                      placeholder="Leave a heartfelt message..."
                      maxLength={500}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{signatoryNote.length}/500 characters</p>
                </div>

                {/* Signature Canvas */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Signature *
                  </label>
                  
                  <SignatureTools
                    selectedTool={selectedTool}
                    onToolChange={setSelectedTool}
                    strokeColor={strokeColor}
                    onColorChange={setStrokeColor}
                    strokeWidth={strokeWidth}
                    onStrokeWidthChange={setStrokeWidth}
                    canUndo={canvasActions?.canUndo}
                    canRedo={canvasActions?.canRedo}
                    onUndo={canvasActions?.undo}
                    onRedo={canvasActions?.redo}
                    onClear={canvasActions?.clear}
                  />

                  <CanvasBoard
                    ref={canvasRef}
                    width={500}
                    height={300}
                    tool={selectedTool}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    textSignatures={textSignatures}
                    onSignatureChange={setCanvasActions}
                    onAddTextSignature={handleTextToolClick}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Submit Signature
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Signature Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                Previous Signatures
              </h2>
              
              <SignatureGallery 
                studentId={studentId}
                showPrivateDetails={false}
              />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-white/80"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span>Powered by SignOut Digital</span>
            <ExternalLink className="w-4 h-4" />
          </div>
          <p className="text-sm">
            Create your own digital sign-out page and collect memories from your friends!
          </p>
        </motion.div>
      </div>

      {/* Text Signature Input Modal */}
      <TextSignatureInput
        isVisible={showTextInput}
        position={textInputPosition}
        strokeColor={strokeColor}
        onAdd={handleAddTextSignature}
        onCancel={() => setShowTextInput(false)}
      />

      {/* Thank You Popup */}
      <ThankYouPopup
        isVisible={showThankYou}
        config={student?.popup_config}
        onClose={() => setShowThankYou(false)}
      />
    </div>
  )
}

export default SigningPage