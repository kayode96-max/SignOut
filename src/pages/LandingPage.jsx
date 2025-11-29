import { motion } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'
import {
  PenTool,
  Heart,
  Share2,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const LandingPage = () => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const features = [
    {
      icon: PenTool,
      title: "Digital Signatures",
      description: "Let friends sign with realistic ink, creative fonts, and personal notes."
    },
    {
      icon: Share2,
      title: "Instant Sharing",
      description: "Share your unique link and watch signatures appear in real-time."
    },
    {
      icon: Heart,
      title: "Emotional Connection",
      description: "Customize thank-you messages and confetti for every signer."
    },
    {
      icon: Download,
      title: "Keep Forever",
      description: "Export your entire memory board as images or a digital keepsake."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <PenTool className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">SignOut Digital</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Log In
              </Link>
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>The modern way to graduate</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
                Your Final Year <br />
                <span className="text-primary-600">Digital Sign-Out</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Replace the physical notebook with a beautiful, interactive digital memory board.
                Collect signatures, messages, and well-wishes from friends near and far.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Create Your Page
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login" // Demo link could go here
                  className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  View Demo
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 text-primary-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Three simple steps to create your lasting digital memory.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-10" />

            <div className="text-center bg-gray-50">
              <div className="w-16 h-16 bg-white border-4 border-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-primary-600 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">Sign up and customize your personal sign-out page with themes and photos.</p>
            </div>

            <div className="text-center bg-gray-50">
              <div className="w-16 h-16 bg-white border-4 border-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-primary-600 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Share Link</h3>
              <p className="text-gray-600">Send your unique link to friends, classmates, and family anywhere in the world.</p>
            </div>

            <div className="text-center bg-gray-50">
              <div className="w-16 h-16 bg-white border-4 border-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-primary-600 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collect Memories</h3>
              <p className="text-gray-600">Watch signatures roll in and export your memory board to keep forever.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <PenTool className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">SignOut Digital</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SignOut Digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
