import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Sparkles } from 'lucide-react'

const ThankYouPopup = ({ isVisible, config, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false)

  // Default configuration
  const defaultConfig = {
    title: 'Thank You! 🎓',
    message: 'Thank you for signing my digital sign-out page! Your support means the world to me.',
    backgroundColor: '#f0f9ff',
    showConfetti: true
  }

  const popupConfig = { ...defaultConfig, ...config }

  useEffect(() => {
    if (isVisible && popupConfig.showConfetti) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, popupConfig.showConfetti])

  const createConfettiPiece = (index) => ({
    id: index,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    color: ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
  })

  const confettiPieces = Array.from({ length: 50 }, (_, i) => createConfettiPiece(i))

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          {/* Confetti */}
          {showConfetti && (
            <div className="confetti">
              {confettiPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  initial={{ y: -100, rotate: 0, scale: 1 }}
                  animate={{ 
                    y: window.innerHeight + 100, 
                    rotate: 360,
                    scale: [1, 1.2, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: piece.animationDelay,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${piece.left}%`,
                    backgroundColor: piece.color
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: popupConfig.backgroundColor }}
          >
            <div className="rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-sm">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Icon Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Heart className="w-10 h-10 text-red-500" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  {popupConfig.title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-700 text-lg leading-relaxed mb-8"
                >
                  {popupConfig.message}
                </motion.p>

                {/* Decorative Elements */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-4 text-yellow-500"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        rotate: [0, 20, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        repeatDelay: 1
                      }}
                    >
                      <Sparkles className="w-6 h-6" fill="currentColor" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="mt-8 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-full transition-colors shadow-lg"
                >
                  Continue Exploring
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ThankYouPopup