# SignOut - Digital Final Year Sign-Out System

A complete, production-ready digital sign-out platform for final-year students built with React, Vite, Supabase, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Digital Signature Canvas**: Draw or type signatures using Konva.js
- **Real-time Updates**: Live signature gallery with Supabase Realtime
- **Thank You Cards**: Auto-generated personalized cards for each signature
- **Theme Customization**: Multiple gradient backgrounds and color schemes
- **Custom Thank You Popups**: Personalized messages with confetti animations

### Student Features
- **Personal Dashboard**: Manage signatures, view analytics, customize page
- **Unique Public URLs**: Each student gets `/sign/:studentId` for sharing
- **Signature Management**: View names, notes, timestamps, and signature images
- **Bulk Export**: Download all signatures and thank you cards as ZIP
- **Theme Editor**: Choose from 6+ gradient backgrounds
- **Popup Customization**: Configure thank you messages and animations

### Public Features
- **Easy Signing**: Draw with pen tool or add text signatures
- **Multiple Colors**: Color picker with preset and custom colors
- **Undo/Redo**: Full signature editing history
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Gallery**: See previous signatures update live

### Technical Features
- **Authentication**: Supabase Auth with email/password and magic links
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage for signature images
- **Real-time**: Live updates using Supabase Realtime subscriptions
- **Export**: HTML-to-image conversion for cards and signatures
- **Security**: Protected routes and secure API endpoints

## 🛠 Technology Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Animation**: Framer Motion for smooth UI animations
- **Canvas**: Konva.js and React-Konva for signature drawing
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Routing**: React Router DOM with protected routes
- **Export**: html-to-image for PNG generation
- **Styling**: TailwindCSS with custom design system
- **Icons**: Lucide React for consistent iconography

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Update environment file with your Supabase credentials
# Edit .env file with your Supabase project details
```

### 2. Supabase Configuration

1. Create a new Supabase project
2. Update `.env` with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the database schema from `supabase-schema.sql` in your Supabase SQL editor

### 3. Development Server
```bash
npm run dev
```
Visit `http://localhost:5173`

### 4. Production Build
```bash
npm run build
npm run preview
```

## 🗄 Database Schema

The system uses three main tables:

### `students`
- Student profiles with theme preferences and popup configurations
- Links to Supabase Auth users

### `signatures` 
- Signature records with image URLs, names, and notes
- Real-time subscriptions enabled

### `thank_you_cards`
- Auto-generated cards for each signature
- Customizable with backgrounds, messages, and decorations

## 🎨 Component Architecture

### Core Components
- **`CanvasBoard`**: Signature drawing canvas with Konva.js
- **`SignatureTools`**: Pen tools, colors, and editing controls
- **`SignatureGallery`**: Real-time signature display with lazy loading
- **`ThankYouPopup`**: Animated popup with confetti effects

### Page Components
- **`Login`**: Authentication with multiple sign-in options
- **`Dashboard`**: Student control panel and analytics
- **`SigningPage`**: Public signing interface
- **`ThankYouCards`**: Card management and editing

### Settings Components  
- **`ThemeSettings`**: Background customization
- **`PopupSettings`**: Thank you message configuration
- **`ThankYouCardEditor`**: Card editing with html-to-image export

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🔒 Security Features

- **Row Level Security**: Database policies restrict access to own data
- **Protected Routes**: Client-side route protection
- **Input Validation**: Sanitized inputs and length limits
- **Authentication**: Secure session management with Supabase Auth

## 🎯 Usage Guide

### For Students
1. **Sign Up**: Create account with email/password
2. **Dashboard**: Access your control panel at `/dashboard`
3. **Customize**: Set theme and thank you message
4. **Share**: Copy your unique signing URL
5. **Monitor**: Watch signatures come in real-time
6. **Export**: Download cards and signatures

### For Signers  
1. **Visit**: Go to student's shared URL
2. **Sign**: Draw or type your signature
3. **Message**: Add optional note
4. **Submit**: See thank you popup
5. **View**: Browse other signatures in gallery

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Built with ❤️ for final-year students everywhere!
