// Environment configuration validation
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  vercel: {
    blobToken: process.env.BLOB_READ_WRITE_TOKEN,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export function validateConfig() {
  const missing = [];
  
  if (!config.openai.apiKey) {
    missing.push('OPENAI_API_KEY');
  }
  
  if (!config.vercel.blobToken) {
    missing.push('BLOB_READ_WRITE_TOKEN');
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check the setup instructions in the README.'
    );
  }
  
  return true;
} 