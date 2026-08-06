import { useState, useEffect, useRef, useCallback } from 'react';

// Advanced dictionary for grocery-specific NLP correction to make voice search "100% accurate"
const groceryCorrections = {
  "aata": "atta",
  "attah": "atta",
  "daal": "dal",
  "dall": "dal",
  "panir": "paneer",
  "shakkar": "sugar",
  "chini": "sugar",
  "chawal": "rice",
  "dudh": "milk",
  "sabji": "vegetables",
  "sabzi": "vegetables",
  "froot": "fruits",
  "biskut": "biscuit",
  "biscut": "biscuit",
  "maggi": "maggi",
  "megi": "maggi",
  "maggie": "maggi",
  "soyabin": "soyabean",
  "ghi": "ghee",
  "tel": "oil",
  "masale": "masala",
  "haldi": "turmeric",
  "mirch": "chilli",
  "mirchi": "chilli",
  "dhaniya": "coriander",
  "jeera": "cumin",
  "jira": "cumin",
  "sarso": "mustard",
  "sarson": "mustard",
  "adrak": "ginger",
  "lehsun": "garlic",
  "lasun": "garlic",
  "pyaaz": "onion",
  "pyaz": "onion",
  "alu": "potato",
  "aloo": "potato",
  "tamatar": "tomato"
};

const enhanceTranscript = (text) => {
  if (!text) return '';
  // Remove punctuation
  let cleanText = text.replace(/[.,?!]/g, '').trim();
  
  // Replace words based on dictionary
  const words = cleanText.split(/\s+/);
  const enhancedWords = words.map(word => {
    const lower = word.toLowerCase();
    return groceryCorrections[lower] || word;
  });
  
  const finalString = enhancedWords.join(' ');
  return finalString.charAt(0).toUpperCase() + finalString.slice(1);
};

/**
 * useVoiceSearch — Web Speech API hook for voice-to-text search.
 * Supports English, Hindi, and Hinglish. Auto-stops on silence.
 */
export default function useVoiceSearch({ onResult, lang = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle | listening | processing | error
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice search is not supported in this browser.');
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice search is not supported in this browser.');
      setStatus('error');
      return;
    }

    // Cleanup any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Configuration
    recognition.lang = lang; // 'hi-IN' supports both Hindi and Hinglish
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      setStatus('processing');
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setTranscript(enhanceTranscript(currentText) || currentText);

      // Auto-trigger search when we get a final result
      if (finalTranscript && onResultRef.current) {
        onResultRef.current(enhanceTranscript(finalTranscript));
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone permission denied. Please allow microphone access.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        case 'aborted':
          // User cancelled, not an error
          setError(null);
          setStatus('idle');
          return;
        default:
          setError(`Voice error: ${event.error}`);
      }
      setStatus('error');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status !== 'error') {
        setStatus('idle');
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setError('Could not start voice recognition.');
      setStatus('error');
    }
  }, [lang, status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setStatus('idle');
  }, []);

  const resetVoice = useCallback(() => {
    stopListening();
    setTranscript('');
    setError(null);
    setStatus('idle');
  }, [stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    status,
    error,
    isSupported,
    startListening,
    stopListening,
    resetVoice,
  };
}
