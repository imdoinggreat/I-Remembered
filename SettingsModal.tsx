
import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Save } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      // Only show the stored key if it is NOT the env variable (security)
      if (stored && stored !== process.env.API_KEY) {
        setApiKey(stored);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKey('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Key size={18} className="mr-2 text-indigo-600" />
            Settings & API Key
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            To use AI features (Pronunciation, Mnemonics, Images), you need a Google Gemini API Key.
          </p>

          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-xs text-blue-700">
             <strong>Note:</strong> Your key is stored locally in your browser. We do not see it.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Enter your Gemini API Key
            </label>
            <Input 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              type="password"
              className="font-mono text-sm"
            />
            <div className="flex justify-between items-center pt-1">
               <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                Get a free key here <ExternalLink size={10} className="ml-1" />
              </a>
              {apiKey && (
                 <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                    Clear Key
                 </button>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button 
                onClick={handleSave} 
                className={`w-full flex justify-center items-center ${isSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isSaved ? 'Saved!' : 'Save API Key'}
              {!isSaved && <Save size={16} className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
