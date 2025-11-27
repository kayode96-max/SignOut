import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, User, MessageSquare, ExternalLink, Heart } from 'lucide-react'
import CanvasBoard from '../components/CanvasBoard'
import SignatureTools from '../components/SignatureTools'
import TextSignatureInput from '../components/TextSignatureInput'
import SignatureGallery from '../components/SignatureGallery'
import ThankYouPopup from '../components/ThankYouPopup'
import { database, storage } from '../lib/supabase'

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
      try {
        setLoading(true)
        setError('')
        setStudent(null) // Clear previous student data to prevent caching
        
        console.log('Loading student profile for ID:', studentId)
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Student loading timeout')
          setLoading(false)
          setError('Loading timeout. Please try again.')
        }, 10000)
        
        const { data, error: fetchError } = await database.getStudentProfile(studentId)
        clearTimeout(timeoutId)
        console.log('Student profile result:', { data, error: fetchError })
        
        if (fetchError || !data) {
          // Check if this looks like a UUID (real student) vs demo ID
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)
          
          if (isUUID) {
            // Real student ID but not found in database - create a mock student for demo
            console.log('Creating mock student for UUID:', studentId)
            const mockStudent = {
              id: studentId,
              email: `student-${studentId.substring(0, 8)}@example.com`,
              name: `Student ${studentId.substring(0, 8)}`,
              theme: {
                background: 'gradient-blue',
                primaryColor: '#3b82f6',
                secondaryColor: '#1d4ed8'
              },
              popup_config: {
                title: 'Thank You!',
                message: 'Thank you for signing my digital sign-out page! 🎓',
                backgroundColor: '#f0f9ff',
                showConfetti: true
              }
            }
            setStudent(mockStudent)
          } else {
            // Demo/test student - create mock
            const mockStudent = {
              id: studentId,
              name: studentId === 'test-student-id' ? 'Demo Student' : `Student ${studentId}`,
              email: `${studentId}@demo.com`,
              theme: {
                background: 'gradient-blue',
                primaryColor: '#3b82f6',
                secondaryColor: '#1d4ed8'
              },
              popup_config: {
                title: 'Thank You!',
                message: 'Thank you for signing my digital sign-out page! 🎓',
                backgroundColor: '#f0f9ff',
                showConfetti: true
              }
            }
            setStudent(mockStudent)
          }
        } else {
          setStudent(data)
        }
      } catch (err) {
        console.error('Error in loadStudent:', err)
        setError('Failed to load page')
        setStudent(null)
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      loadStudent()
    } else {
      setLoading(false)
      setError('No student ID provided')
    }
    
    // Cleanup function
    return () => {
      setLoading(false)
    }
  }, [studentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!signatoryName.trim()) {
      setError('Please enter your name')
      return
    }

    console.log('Canvas actions:', canvasActions) // Debug log
    if (!canvasActions || canvasActions.isEmpty) {
      setError('Please add your signature')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Check if this is a demo student or real student
      const isDemo = studentId === 'test-student-id' || 
                     !student?.email?.includes('@') || 
                     student?.email?.includes('@demo.com') ||
                     student?.email?.includes('@example.com') ||
                     !student?.created_at // Mock students don't have created_at from database
      
      if (isDemo) {
        // Export signature for demo
        const blob = await canvasActions.exportAsBlob()
        if (!blob) {
          throw new Error('Failed to export signature')
        }
        
        // Create a local URL for the signature
        const signatureUrl = URL.createObjectURL(blob)
        
        // Store demo signature in localStorage
        const demoSignature = {
          id: Date.now(),
          student_id: studentId,
          signature_url: signatureUrl,
          signatory_name: signatoryName.trim(),
          signatory_note: signatoryNote.trim() || null,
          created_at: new Date().toISOString()
        }
        
        const existingSignatures = JSON.parse(localStorage.getItem(`demo-signatures-${studentId}`) || '[]')
        existingSignatures.unshift(demoSignature)
        localStorage.setItem(`demo-signatures-${studentId}`, JSON.stringify(existingSignatures.slice(0, 10))) // Keep only last 10
        
        console.log('Demo signature saved locally:', demoSignature)
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800))
      } else {
        // For real students, ensure the student exists in database first
        console.log('Ensuring student exists in database:', studentId)
        
        // Try to create student record if it doesn't exist
        if (!student?.created_at) {
          console.log('Creating student record in database...')
          try {
            const { data: createStudentData, error: createStudentError } = await database.createStudentProfile({
              id: studentId,
              email: student?.email || `student-${studentId}@example.com`,
              user_metadata: { full_name: student?.name || 'Student' }
            })
            
            if (createStudentError) {
              console.error('Failed to create student:', createStudentError)
              // Continue anyway - student might already exist
            } else {
              console.log('Student created successfully:', createStudentData)
            }
          } catch (err) {
            console.error('Error creating student:', err)
            // Continue anyway
          }
        }
        
        // Export signature as blob
        const blob = await canvasActions.exportAsBlob()
        if (!blob) {
          throw new Error('Failed to export signature')
        }

        // Generate unique filename
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.png`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await storage.uploadSignature(blob, fileName)
        if (uploadError) {
          throw new Error('Failed to upload signature')
        }

        // Get public URL
        const signatureUrl = storage.getSignatureUrl(fileName)

        // Create signature record
        const signatureData = {
          student_id: studentId,
          signature_url: signatureUrl,
          signatory_name: signatoryName.trim(),
          signatory_note: signatoryNote.trim() || null,
        }

        console.log('Attempting to create signature:', signatureData)
        const { data, error: createError } = await database.createSignature(signatureData)
        console.log('Database response:', { data, error: createError })
        
        if (createError) {
          console.error('Database error details:', createError)
          throw new Error(`Failed to save signature: ${createError.message}`)
        }
      }

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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {student?.name}'s Sign-Out Page
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Leave your signature and a message to wish me well on my next journey! 🎓
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