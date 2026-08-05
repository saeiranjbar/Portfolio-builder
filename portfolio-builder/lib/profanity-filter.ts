// List of prohibited words and patterns
const prohibitedWords = [
  // Profanity
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'hell',
  // Hate speech patterns
  'hate', 'kill', 'die', 'death', 'murder', 'terrorist', 'terrorism',
  // Harassment
  'stupid', 'idiot', 'moron', 'retard', 'dumb', 'loser',
  // Threats
  'threat', 'threaten', 'attack', 'destroy', 'ruin',
  // Spam patterns
  'viagra', 'casino', 'lottery', 'winner', 'click here', 'free money',
  // Discriminatory terms (partial list)
  'racist', 'nazi', 'fascist',
];

// Patterns for aggressive language detection
const aggressivePatterns = [
  /\b(hate|kill|die|destroy)\s+you\b/gi,
  /\bi\s+will\s+(kill|hurt|destroy)\b/gi,
  /\byou\s+(are|re)\s+(stupid|idiot|dumb|ugly|fat|worthless)/gi,
  /\bgo\s+(kill|die)\s+yourself\b/gi,
  /\bno\s+one\s+(likes|loves|wants)\s+you\b/gi,
];

// Leetspeak character mappings
const leetMap: Record<string, string> = {
  '4': 'a',
  '@': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
};

// Convert leetspeak to normal text
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  for (const [leet, normal] of Object.entries(leetMap)) {
    normalized = normalized.replace(new RegExp(leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), normal);
  }
  return normalized;
}

// Check for prohibited words
export function containsProhibitedWords(text: string): { hasProhibited: boolean; foundWords: string[] } {
  const normalizedText = normalizeText(text);
  const foundWords: string[] = [];
  
  for (const word of prohibitedWords) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      foundWords.push(word);
    }
  }
  
  return {
    hasProhibited: foundWords.length > 0,
    foundWords: [...new Set(foundWords)], // Remove duplicates
  };
}

// Check for aggressive patterns
export function containsAggressivePatterns(text: string): { hasAggressive: boolean; patterns: string[] } {
  const foundPatterns: string[] = [];
  
  for (const pattern of aggressivePatterns) {
    if (pattern.test(text)) {
      foundPatterns.push(pattern.source);
    }
  }
  
  return {
    hasAggressive: foundPatterns.length > 0,
    patterns: foundPatterns,
  };
}

// Main validation function
export function validateMessage(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for prohibited words
  const { hasProhibited, foundWords } = containsProhibitedWords(text);
  if (hasProhibited) {
    errors.push(`Your message contains inappropriate language. Please keep it professional.`);
  }
  
  // Check for aggressive patterns
  const { hasAggressive } = containsAggressivePatterns(text);
  if (hasAggressive) {
    errors.push('Your message appears to contain aggressive or threatening language. Please be respectful.');
  }
  
  // Check for excessive caps (shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 10) {
    errors.push('Please avoid using excessive capital letters.');
  }
  
  // Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 2) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  const maxRepetition = Math.max(...Object.values(wordCounts));
  if (maxRepetition > 5) {
    errors.push('Your message contains excessive repetition.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitize message (optional - replaces prohibited words with asterisks)
export function sanitizeMessage(text: string): string {
  let sanitized = text;
  
  for (const word of prohibitedWords) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
  }
  
  return sanitized;
}