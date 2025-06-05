# Speech to Text Service

A modern web application for recording audio and converting speech to text using OpenAI's Whisper API. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Current Features ✅
- **Audio Recording**: Record high-quality audio directly in the browser
- **Real-time Recording Display**: Visual feedback with timer and waveform
- **Audio Playback**: Review recordings before transcription
- **Responsive Design**: Beautiful UI that works on all devices
- **Transcription History**: View and manage all your transcriptions
- **Copy to Clipboard**: Easy copying of transcribed text
- **OpenAI Integration**: Real speech-to-text using Whisper API
- **Vercel Blob Storage**: Secure audio file storage
- **PostgreSQL Database**: Persistent storage with Neon + Prisma ORM
- **Token & Cost Tracking**: Monitor usage and costs per transcription
- **Error Handling**: Comprehensive error handling and user feedback

### Planned Features 🚧
- **User Authentication**: Secure user accounts
- **Export Options**: Download transcriptions in various formats
- **Language Detection**: Auto-detect spoken language
- **Batch Processing**: Upload and transcribe multiple files
- **Analytics Dashboard**: Detailed usage statistics
- **Transcription Search**: Search through historical transcriptions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Audio API**: Web MediaRecorder API
- **Database**: PostgreSQL with Neon + Prisma ORM
- **File Storage**: Vercel Blob
- **AI**: OpenAI Whisper API
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Vercel account (for Blob storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd speech-to-text
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Vercel Blob Configuration  
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Database Configuration
POSTGRES_URL=your_neon_database_url_here

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

#### Vercel Blob Token
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Storage** tab
4. Create a new **Blob** store
5. Copy the **BLOB_READ_WRITE_TOKEN** and add it to your `.env.local` file

#### Neon Database URL
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in or create an account
3. Create a new project
4. Go to **Connection Details**
5. Copy the **Connection String** and add it as `POSTGRES_URL` to your `.env.local` file

4. Validate your setup (optional but recommended):
```bash
npm run setup-check
```

5. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Usage

1. **Record Audio**: Click the microphone button to start recording
2. **Stop Recording**: Click "Stop Recording" when finished
3. **Review**: Listen to your recording using the audio player
4. **Transcribe**: Click "Transcribe" to convert speech to text using OpenAI Whisper
5. **Manage**: View your transcription history, copy text, or expand for full content
6. **Storage**: Audio files are automatically saved to Vercel Blob storage

## 🎯 Current Status

**Phase 1: Frontend ✅ (Complete)**
- [x] Audio recording functionality
- [x] Real-time recording interface
- [x] Audio playback
- [x] Transcription history UI
- [x] Responsive design
- [x] Copy to clipboard

**Phase 2: Backend APIs ✅ (Complete)**
- [x] OpenAI Whisper API integration
- [x] Vercel Blob storage setup
- [x] File upload and management
- [x] Transcription endpoint
- [x] Error handling and validation

**Phase 3: Database ✅ (Complete)**
- [x] PostgreSQL setup with Neon
- [x] Transcription persistence with Prisma ORM
- [x] Data retrieval APIs
- [x] Token and cost tracking
- [x] Automatic data loading

**Phase 4: Enhanced Features (Future)**
- [ ] User authentication
- [ ] Export functionality
- [ ] Advanced audio processing
- [ ] Batch transcription

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   │   └── route.ts    # Speech-to-text API endpoint
│   │   └── health/
│   │       └── route.ts    # Health check endpoint
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main application
│   └── globals.css         # Global styles
├── components/
│   ├── AudioRecorder.tsx   # Recording interface
│   └── TranscriptionHistory.tsx # History display
├── lib/
│   └── config.ts           # Configuration utilities
└── scripts/
    └── setup-check.js      # Setup validation script
```

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run setup-check`: Validate environment configuration
- `npm run type-check`: Run TypeScript type checking
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema to database
- `npm run db:studio`: Open Prisma Studio (database GUI)

## 🔧 Troubleshooting

### Common Issues

#### "OpenAI API key not configured" error
- Ensure your `.env.local` file contains a valid `OPENAI_API_KEY`
- Run `npm run setup-check` to validate your configuration
- Check that your OpenAI account has credits available

#### "Vercel Blob token not configured" error
- Ensure your `.env.local` file contains a valid `BLOB_READ_WRITE_TOKEN`
- Make sure the token has read/write permissions
- Verify the Vercel Blob store is created and active

#### Microphone permission denied
- Check browser permissions for microphone access
- Try refreshing the page and granting permissions again
- Ensure your microphone is working in other applications

#### Audio recording not working
- Try using a different browser (Chrome/Edge recommended)
- Check if WebRTC is supported in your browser
- Verify your microphone is not being used by other applications

### Testing Your Setup

1. Run the health check: `http://localhost:3000/api/health`
2. Use the setup validation: `npm run setup-check`
3. Test a simple recording to verify everything works

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Roadmap

- [ ] Backend API development
- [ ] OpenAI integration
- [ ] Database setup
- [ ] User authentication
- [ ] File management
- [ ] Advanced features
- [ ] Mobile app (future)

---

**Note**: This is currently a frontend-only implementation. The transcription feature shows mock data while we develop the backend integration.
