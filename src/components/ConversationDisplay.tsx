'use client';

interface ConversationDisplayProps {
  text: string;
  className?: string;
}

export default function ConversationDisplay({ text, className = '' }: ConversationDisplayProps) {
  // Check if the text appears to be a conversation (contains speaker labels)
  const isConversation = /persona \d+:/i.test(text);
  
  if (!isConversation) {
    // Regular text display
    return (
      <div className={`whitespace-pre-wrap ${className} text-gray-700`}>
        {text}
      </div>
    );
  }

  // Parse conversation text into speakers and lines
  const parseConversation = (conversationText: string) => {
    const lines = conversationText.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const speakerMatch = line.match(/^(persona \d+):\s*(.*)/i);
      
      if (speakerMatch) {
        const [, speaker, content] = speakerMatch;
        return {
          id: index,
          speaker: speaker.trim(),
          content: content.trim(),
          isSystemLine: false
        };
      }
      
      // Handle lines that don't start with speaker (continuation lines)
      return {
        id: index,
        speaker: null,
        content: line.trim(),
        isSystemLine: true
      };
    }).filter(line => line.content); // Remove empty lines
  };

  const conversationLines = parseConversation(text);
  
  // Define colors for different speakers
  const speakerColors = {
    'persona 1': 'bg-blue-100 border-l-blue-500 text-blue-900',
    'persona 2': 'bg-green-100 border-l-green-500 text-green-900',
    'persona 3': 'bg-purple-100 border-l-purple-500 text-purple-900',
    'persona 4': 'bg-orange-100 border-l-orange-500 text-orange-900',
    'persona 5': 'bg-pink-100 border-l-pink-500 text-pink-900',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {conversationLines.map((line) => {
        if (line.isSystemLine) {
          // System lines or continuation text
          return (
            <div key={line.id} className="text-gray-600 italic pl-4">
              {line.content}
            </div>
          );
        }

        const speakerKey = line.speaker?.toLowerCase() as keyof typeof speakerColors;
        const colorClass = speakerColors[speakerKey] || 'bg-gray-100 border-l-gray-500 text-gray-900';

        return (
          <div key={line.id} className={`p-3 rounded-r-lg border-l-4 ${colorClass}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  {line.speaker}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">
                  {line.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Conversation Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-gray-700">Resumen de conversación</span>
        </div>
        <p className="text-xs text-gray-600">
          Se identificaron {Object.keys(speakerColors).filter(speaker => 
            text.toLowerCase().includes(speaker)
          ).length} personas en esta conversación.
        </p>
      </div>
    </div>
  );
} 