import React, { useState, useEffect, useRef } from 'react';
import { Globe, Mic, Volume2, Copy, Download, Share2, History, ChevronDown, Loader2, X, CheckCircle, AlertCircle, Info, ArrowLeftRight } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }, { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' }, { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' }, { code: 'hi', name: 'Hindi' }, { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' }, { code: 'ml', name: 'Malayalam' }, { code: 'kn', name: 'Kannada' },
  { code: 'bn', name: 'Bengali' }, { code: 'th', name: 'Thai' }, { code: 'vi', name: 'Vietnamese' },
  { code: 'tr', name: 'Turkish' }, { code: 'nl', name: 'Dutch' }, { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' }, { code: 'he', name: 'Hebrew' }, { code: 'fa', name: 'Persian' },
];

export default function AdvancedTranslator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('ta');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('translationHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [translationCount, setTranslationCount] = useState(() => parseInt(localStorage.getItem('translationCount') || '0'));

  useEffect(() => {
    const timer = setTimeout(() => message.text && setMessage({ text: '', type: '' }), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (autoTranslate && inputText.trim()) {
      const timer = setTimeout(translateText, 800);
      return () => clearTimeout(timer);
    }
  }, [inputText, targetLang]);

  const showToast = (text, type = 'info') => setMessage({ text, type });

  const translateText = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(inputText)}`
      );
      const data = await res.json();
      const result = data[0]?.map(item => item[0]).join('') || '';
      setTranslatedText(result);

      const entry = { source: inputText, translated: result, sourceLang: sourceLang === 'auto' ? 'auto' : sourceLang, targetLang, timestamp: new Date().toISOString() };
      const newHistory = [entry, ...history.slice(0, 9)];
      setHistory(newHistory);
      localStorage.setItem('translationHistory', JSON.stringify(newHistory));
      setTranslationCount(prev => {
        const count = prev + 1;
        localStorage.setItem('translationCount', count);
        return count;
      });
      showToast('Translation successful!', 'success');
    } catch (err) {
      showToast('Translation failed. Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return showToast('Cannot swap with Auto-detect', 'error');
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const copyText = () => { navigator.clipboard.writeText(translatedText); showToast('Copied!', 'success'); };
  const speakText = () => { const u = new SpeechSynthesisUtterance(translatedText); u.lang = targetLang.replace('zh', 'zh-CN'); speechSynthesis.speak(u); };
  const downloadText = () => {
    const blob = new Blob([`Original: ${inputText}\n\nTranslated: ${translatedText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `translation_${Date.now()}.txt`; a.click();
  };
  const shareText = async () => navigator.share ? await navigator.share({ text: translatedText }) : copyText();

  const startVoiceInput = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) return showToast('Voice not supported', 'error');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;
    recognition.onresult = e => setInputText(e.results[0][0].transcript);
    recognition.start();
    showToast('Listening...', 'info');
  };

  const loadFromHistory = (entry) => {
    setInputText(entry.source);
    setTranslatedText(entry.translated);
    setSourceLang(entry.sourceLang);
    setTargetLang(entry.targetLang);
    setShowHistory(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 bg-[length:400%_400%] animate-gradient-xy">
        <div className="min-h-screen bg-black/30 backdrop-blur-md">
          <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-10">

            {/* Header */}
            <div className="text-center mb-8 text-white">
              <Globe className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 animate-spin-slow" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">Translator Pro</h1>
              <p className="text-lg sm:text-xl opacity-90">100+ Languages • Instant • Voice • History</p>
            </div>

            {/* Main Card */}
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-5 sm:p-8">

                {/* Language Selector */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
                      className="w-full sm:w-auto px-4 py-3 bg-white/20 backdrop-blur text-white rounded-2xl border border-white/30 focus:ring-4 focus:ring-white/50 text-sm sm:text-base">
                      <option value="auto">Auto Detect</option>
                      {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                    <button onClick={swapLanguages} className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition">
                      <ArrowLeftRight className="w-5 h-5 text-white" />
                    </button>
                    <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
                      className="w-full sm:w-auto px-4 py-3 bg-white/20 backdrop-blur text-white rounded-2xl border border-white/30 focus:ring-4 focus:ring-white/50 text-sm sm:text-base">
                      {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                  </div>

                  {/* Quick Languages */}
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
                    {['es', 'fr', 'de', 'zh', 'ja', 'hi', 'ta', 'ar'].map(code => (
                      <button key={code} onClick={() => setTargetLang(code)}
                        className="px-3 py-2 text-xs sm:text-sm bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition">
                        {languages.find(l => l.code === code)?.name.slice(0, 3).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Translation Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/80 text-sm sm:text-base">
                      <span className="font-medium">Input</span>
                      <span>{inputText.length}/5000</span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value.slice(0, 5000))}
                        placeholder="Type, paste, or speak..."
                        className="w-full h-48 sm:h-64 p-4 bg-white/20 backdrop-blur border border-white/30 rounded-2xl text-white placeholder-white/50 resize-none focus:ring-4 focus:ring-white/50 outline-none"
                      />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button onClick={() => setInputText('')} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30">
                          <X className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={startVoiceInput} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30">
                          <Mic className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Output */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/80 text-sm sm:text-base">
                      <span className="font-medium">Translation</span>
                      {translatedText && (
                        <div className="flex gap-3 text-xs sm:text-sm">
                          <button onClick={copyText} className="flex items-center gap-1 hover:text-white">
                            <Copy className="w-4 h-4" /> Copy
                          </button>
                          <button onClick={speakText} className="flex items-center gap-1 hover:text-white">
                            <Volume2 className="w-4 h-4" /> Speak
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="h-48 sm:h-64 p-4 bg-white/20 backdrop-blur border border-white/30 rounded-2xl text-white overflow-y-auto">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-10 h-10 animate-spin text-white" />
                        </div>
                      ) : translatedText || <span className="text-white/60">Translation appears here...</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <button onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
                    Advanced <ChevronDown className={`w-4 h-4 transition ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                  {showAdvanced && (
                    <label className="flex items-center gap-2 text-white text-sm">
                      <input type="checkbox" checked={autoTranslate} onChange={e => setAutoTranslate(e.target.checked)}
                        className="w-5 h-5 rounded accent-pink-500" />
                      Auto-translate
                    </label>
                  )}
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => setShowHistory(true)}
                      className="flex-1 sm:flex-initial px-5 py-3 bg-white/20 backdrop-blur rounded-2xl text-white hover:bg-white/30 flex items-center justify-center gap-2 text-sm">
                      <History className="w-5 h-5" /> History
                    </button>
                    <button onClick={translateText} disabled={isLoading || !inputText.trim()}
                      className="flex-1 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-50">
                      {isLoading ? 'Translating...' : 'Translate'}
                    </button>
                  </div>
                </div>

                {/* Extra Actions */}
                {translatedText && (
                  <div className="flex justify-center gap-6 mt-6">
                    <button onClick={downloadText} className="p-4 bg-white/20 rounded-2xl hover:bg-white/30">
                      <Download className="w-6 h-6 text-white" />
                    </button>
                    <button onClick={shareText} className="p-4 bg-white/20 rounded-2xl hover:bg-white/30">
                      <Share2 className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {message.text && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full text-white font-medium shadow-2xl z-50 animate-bounce-in flex items-center gap-3 text-sm sm:text-base
            ${message.type === 'success' ? 'bg-green-600' : message.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <Info className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowHistory(false)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">History</h3>
                <button onClick={() => setShowHistory(false)}><X className="w-7 h-7" /></button>
              </div>
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-10 text-lg">No translations yet</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, i) => (
                    <div key={i} onClick={() => loadFromHistory(entry)}
                      className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 cursor-pointer transition">
                      <div className="text-xs text-gray-500 mb-2">{new Date(entry.timestamp).toLocaleString()}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><strong>{entry.sourceLang}</strong>: {entry.source.slice(0, 70)}...</div>
                        <div><strong>{entry.targetLang}</strong>: {entry.translated.slice(0, 70)}...</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy { animation: gradient-xy 20s ease infinite; }
        @keyframes bounce-in {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
        .animate-spin-slow { animation: spin 25s linear infinite; }
      `}</style>
    </>
  );
}