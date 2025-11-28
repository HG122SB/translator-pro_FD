
// src/hooks/useTranslator.js
import { useState, useEffect } from 'react';
import { languages } from '../languages';

const useTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('ta');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('translationHistory');
    return saved ? JSON.parse(saved) : [];
  });
  // Removed translationCount state since it wasn't actively used in the UI, keeping history relevant.

  useEffect(() => {
    const timer = setTimeout(() => message.text && setMessage({ text: '', type: '' }), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const showToast = (text, type = 'info') => setMessage({ text, type });

  const translateText = async (textToTranslate = inputText, sl = sourceLang, tl = targetLang) => {
    if (!textToTranslate.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(textToTranslate)}`
      );
      const data = await res.json();
      const result = data[0]?.map(item => item[0]).join('') || '';
      setTranslatedText(result);

      const entry = { 
        source: textToTranslate, 
        translated: result, 
        sourceLang: sl === 'auto' ? 'auto' : sl, 
        targetLang: tl, 
        timestamp: new Date().toISOString() 
      };
      
      // Save history, limiting to 10 entries
      setHistory(prevHistory => {
        const newHistory = [entry, ...prevHistory.slice(0, 9)];
        localStorage.setItem('translationHistory', JSON.stringify(newHistory));
        return newHistory;
      });
      localStorage.setItem('translationCount', (parseInt(localStorage.getItem('translationCount') || '0') + 1));
      
      showToast('Translation successful!', 'success');
      return result;
    } catch (err) {
      showToast('Translation failed. Try again.', 'error');
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return showToast('Cannot swap with Auto-detect', 'error');
    const newSourceLang = targetLang;
    const newTargetLang = sourceLang;
    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);
    setInputText(translatedText);
    setTranslatedText(''); // Clear translated text, will re-translate on next input change or button click
    showToast('Languages swapped!', 'info');
  };

  const loadFromHistory = (entry) => {
    setInputText(entry.source);
    setTranslatedText(entry.translated);
    setSourceLang(entry.sourceLang);
    setTargetLang(entry.targetLang);
    showToast(`Loaded from history (${entry.sourceLang} to ${entry.targetLang})`, 'info');
  };

  return {
    inputText, setInputText,
    translatedText, setTranslatedText,
    sourceLang, setSourceLang,
    targetLang, setTargetLang,
    isLoading,
    message, setMessage,
    history, setHistory,
    translateText,
    swapLanguages,
    loadFromHistory,
    showToast,
  };
};

export default useTranslator;