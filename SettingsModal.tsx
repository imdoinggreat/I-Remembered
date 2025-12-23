
import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio?.hasSelectedApiKey) {
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasKey(!!selected);
        } catch (err) {
          console.error("Error checking API key status:", err);
        }
      }
    };
    if (isOpen) {
      checkKey();
    }
  }, [isOpen]);

  const handleConnect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      try {
        await aistudio.openSelectKey();
        setHasKey(true);
        onClose();
      } catch (err) {
        console.error("Error opening key selection dialog:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Key size={18} className="mr-2 text-indigo-600" />
            AI Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            To use AI-powered features such as Pronunciation, Memory Hooks, and Mnemonic Images, you must connect a valid Gemini API Key.
          </p>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
            <div className="text-xs text-indigo-700 leading-relaxed">
              <strong>Secure Connection:</strong> Your API key is handled exclusively through Google AI Studio. We never see or store your private key on our servers.
            </div>
          </div>

          <div className="pt-2">
             <div className="mb-4">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  Learn about billing & paid projects <ExternalLink size={10} className="ml-1" />
                </a>
                <p className="text-[10px] text-gray-400 mt-1">Users must select an API key from a paid Google Cloud project.</p>
             </div>
            
            <Button 
                onClick={handleConnect} 
                className="w-full flex justify-center items-center py-3"
            >
              {hasKey ? 'Change Connected API Key' : 'Connect Gemini API Key'}
              <Key size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
