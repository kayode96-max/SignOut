import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey 
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const database = {
  // Students
  async createStudentProfile(user) {
    console.log('Creating student profile:', user)
    
    const studentData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
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
    
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      
    console.log('Student creation result:', { data, error })
    return { data, error }
  },

  async getStudentProfile(studentId) {
    console.log('Fetching student profile for ID:', studentId)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle()
    
    console.log('Student profile query result:', { data, error, studentId })
    return { data, error }
  },

  async updateStudentProfile(studentId, updates) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .select()
    return { data, error }
  },

  // Signatures
  async createSignature(signatureData) {
    console.log('Creating signature with data:', signatureData)
    
    const { data, error } = await supabase
      .from('signatures')
      .insert([signatureData])
      .select()
    
    if (error) {
      console.error('Supabase signature creation error:', error)
    }
    
    return { data, error }
  },

  async getSignatures(studentId) {
    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getPublicSignatures(studentId) {
    const { data, error } = await supabase
      .from('signatures')
      .select('id, signature_url, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Thank You Cards
  async createThankYouCard(cardData) {
    const { data, error } = await supabase
      .from('thank_you_cards')
      .insert([cardData])
      .select()
    return { data, error }
  },

  async getThankYouCards(studentId) {
    const { data, error } = await supabase
      .from('thank_you_cards')
      .select(`
        *,
        signatures (
          signatory_name,
          signatory_note,
          created_at
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async updateThankYouCard(cardId, updates) {
    const { data, error } = await supabase
      .from('thank_you_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
    return { data, error }
  }
}

// Storage helper functions
export const storage = {
  async uploadSignature(file, fileName) {
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, file)
    return { data, error }
  },

  getSignatureUrl(fileName) {
    const { data } = supabase.storage
      .from('signatures')
      .getPublicUrl(fileName)
    return data.publicUrl
  },

  async deleteSignature(fileName) {
    const { data, error } = await supabase.storage
      .from('signatures')
      .remove([fileName])
    return { data, error }
  }
}

// Realtime subscription helpers
export const realtime = {
  subscribeToSignatures(studentId, callback) {
    return supabase
      .channel(`signatures:student_id=eq.${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signatures',
          filter: `student_id=eq.${studentId}`
        },
        callback
      )
      .subscribe()
  },

  unsubscribe(subscription) {
    supabase.removeChannel(subscription)
  }
}