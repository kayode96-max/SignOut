import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Users, Clock, Loader2 } from 'lucide-react'
import { database, realtime } from '../lib/supabase'

const SignatureGallery = ({ studentId, showPrivateDetails = false }) => {
  const [signatures, setSignatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const observer = useRef()
  const realtimeSubscription = useRef()

  const ITEMS_PER_PAGE = 12

  // Lazy loading reference
  const lastSignatureElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  // Load signatures
  const loadSignatures = async (pageNum = 0, append = false) => {
    try {
      setLoading(true)
      setError('')

      let data = []
      
      // Check if this is a demo student
      if (studentId === 'test-student-id' || studentId?.includes('demo')) {
        // Load demo signatures from localStorage
        const demoSignatures = JSON.parse(localStorage.getItem(`demo-signatures-${studentId}`) || '[]')
        data = showPrivateDetails ? demoSignatures : demoSignatures.map(sig => ({
          id: sig.id,
          signature_url: sig.signature_url,
          created_at: sig.created_at
        }))
      } else {
        // Load from database
        const result = showPrivateDetails 
          ? await database.getSignatures(studentId)
          : await database.getPublicSignatures(studentId)

        if (result.error) {
          setError('Failed to load signatures')
          return
        }
        data = result.data || []
      }

      const startIndex = pageNum * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedData = data.slice(startIndex, endIndex)

      if (append) {
        setSignatures(prev => [...prev, ...paginatedData])
      } else {
        setSignatures(paginatedData)
      }

      setTotalCount(data.length)
      setHasMore(endIndex < data.length)
    } catch (err) {
      setError('Something went wrong')
      console.error('Error loading signatures:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initialize and setup realtime
  useEffect(() => {
    loadSignatures()

    // Setup realtime subscription
    const subscription = realtime.subscribeToSignatures(studentId, (payload) => {
      const newSignature = payload.new
      setSignatures(prev => [newSignature, ...prev])
      setTotalCount(prev => prev + 1)
    })

    realtimeSubscription.current = subscription

    return () => {
      if (realtimeSubscription.current) {
        realtime.unsubscribe(realtimeSubscription.current)
      }
    }
  }, [studentId, showPrivateDetails])

  // Load more signatures when page changes
  useEffect(() => {
    if (page > 0) {
      loadSignatures(page, true)
    }
  }, [page])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  if (loading && signatures.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading signatures...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Heart className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <button
          onClick={() => loadSignatures()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (signatures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No signatures yet</h3>
          <p className="text-gray-600">
            {showPrivateDetails 
              ? "Share your sign-out page link to start collecting signatures!"
              : "Be the first to sign this page!"
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">{totalCount}</span>
          <span>{totalCount === 1 ? 'signature' : 'signatures'}</span>
        </div>
        
        {showPrivateDetails && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Updates in real-time</span>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {signatures.map((signature, index) => {
            const isLast = signatures.length === index + 1
            return (
              <motion.div
                key={signature.id}
                ref={isLast ? lastSignatureElementRef : null}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Signature Image */}
                  <div className="aspect-4/3 bg-gray-50 overflow-hidden">
                    <img
                      src={signature.signature_url}
                      alt="Signature"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTIwIDk1TTEyMCA5NUwxMDAgMTE1TTEwMCAxMTVMODAgOTVNODAgOTVMMTAwIDc1IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTMwIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo='
                      }}
                    />
                  </div>

                  {/* Details (only for private view) */}
                  {showPrivateDetails && (
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 truncate">
                        {signature.signatory_name}
                      </h4>
                      {signature.signatory_note && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {signature.signatory_note}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(signature.created_at)}
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="New signature" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Loading more indicator */}
      {loading && signatures.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading more signatures...</span>
          </div>
        </div>
      )}

      {/* End of signatures indicator */}
      {!hasMore && signatures.length > ITEMS_PER_PAGE && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <Heart className="w-4 h-4" />
            <span>That's all the signatures!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignatureGallery