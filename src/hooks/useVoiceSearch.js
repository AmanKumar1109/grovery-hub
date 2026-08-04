import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useVoiceSearch — Web Speech API hook for voice-to-text search.
 * Supports English, Hindi, and Hinglish. Auto-stops on silence.
 */
export default function useVoiceSearch({ onResult, lang = 'hi-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle | listening | processing | error
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Check browser support
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
      setTranscript(currentText);

      // Auto-trigger search when we get a final result
      if (finalTranscript && onResultRef.current) {
        onResultRef.current(finalTranscript.trim());
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
