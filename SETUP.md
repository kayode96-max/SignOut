# SignOut Setup Guide

This guide will help you set up the complete SignOut digital sign-out system.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Update the `.env` file with your credentials

3. **Setup Database**
   - Go to your Supabase project dashboard
   - Open the SQL Editor
   - Run the entire `supabase-schema.sql` file

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

Update your `.env` file with these values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄 Database Setup Instructions

1. **Open Supabase SQL Editor**
   - Go to your Supabase project
   - Click on "SQL Editor" in the sidebar
   - Create a new query

2. **Run the Schema**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

3. **Verify Setup**
   - Check the "Table Editor" to see the three tables created:
     - `students`
     - `signatures` 
     - `thank_you_cards`

## 🎯 Testing the Application

1. **Start the Dev Server**
   ```bash
   npm run dev
   ```

2. **Create a Test Account**
   - Visit `http://localhost:5173`
   - Click "Sign Up" 
   - Enter test credentials
   - Verify email if required

3. **Test Signing Flow**
   - Copy your signing URL from the dashboard
   - Open it in a new browser/incognito window
   - Add a test signature
   - Verify real-time updates

## 🛠 Customization Options

### Theme Colors
Edit `src/components/ThemeSettings.jsx` to add more gradient options.

### Signature Tools
Modify `src/components/SignatureTools.jsx` to add new drawing tools.

### Thank You Cards
Customize templates in `src/components/ThankYouCardEditor.jsx`.

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify

### Environment Variables for Production
Make sure to add your Supabase credentials to your hosting platform's environment variables.

## 🔧 Troubleshooting

### Common Issues

1. **"Failed to load signatures"**
   - Check your Supabase URL and key in `.env`
   - Ensure the database schema is properly set up
   - Verify RLS policies are active

2. **Authentication not working**
   - Confirm Supabase Auth is enabled
   - Check email confirmation settings
   - Verify redirect URLs in Supabase Auth settings

3. **Signature upload fails**
   - Ensure Supabase Storage bucket "signatures" exists
   - Check storage policies allow public read/write
   - Verify file size limits

4. **Real-time updates not working**
   - Confirm Supabase Realtime is enabled
   - Check browser console for connection errors
   - Verify table-level realtime is enabled

### Development Tips

- Use browser dev tools to inspect network requests
- Check the Supabase logs for backend errors
- Test on multiple devices for responsive design
- Use the React Developer Tools for component debugging

## 🚀 Next Steps

After setup, explore these features:

1. **Theme Customization**: Experiment with different gradient backgrounds
2. **Thank You Messages**: Create personalized popup messages
3. **Thank You Cards**: Design and export custom cards
4. **Analytics**: Monitor signature metrics in the dashboard
5. **Sharing**: Test the sharing functionality across platforms

## 📞 Support

If you encounter issues:

1. Check this guide for common solutions
2. Review the main README.md for detailed documentation
3. Check Supabase documentation for backend issues
4. Create an issue in the repository for bugs

Happy coding! 🎓