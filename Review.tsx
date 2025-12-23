
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Volume2, Lightbulb, Repeat, Award, Keyboard } from 'lucide-react';
import { TextArea } from '../components/Input';
import { VocabularyItem } from '../types';
import { generatePronunciation, optimizeCardContent } from '../services/geminiService';
import { playPcmAudio } from '../services/audioUtils';
import { getDueItems, calculateNextReview } from '../services/srs';

interface ReviewProps {
  items: VocabularyItem[];
  onUpdateItem?: (item: VocabularyItem) => void;
}

type ReviewPhase = 'RECALL' | 'ELABORATION' | 'FINISHED';

export const Review: React.FC<ReviewProps> = ({ items, onUpdateItem }) => {
  const [queue, setQueue] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<ReviewPhase>('RECALL');
  
  const [inputValue, setInputValue] = useState('');
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');

  const [clueDraft, setClueDraft] = useState('');
  const [phoneticDraft, setPhoneticDraft] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dueItems = getDueItems(items);
    if (dueItems.length > 0) {
      setQueue(dueItems);
    } else {
      setQueue([]); 
    }
  }, [items]);

  useEffect(() => {
    if (phase === 'RECALL') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phase, currentIndex]);

  const currentCard = queue[currentIndex];

  const handleRating = useCallback((quality: number) => {
    if (!currentCard || !onUpdateItem) return;

    const updatedItem = calculateNextReview({
      ...currentCard,
      connectionHook: clueDraft || currentCard.connectionHook,
      phonetic: phoneticDraft || currentCard.phonetic
    }, quality);

    onUpdateItem(updatedItem);

    setInputValue('');
    setFeedback('none');
    setPhase('RECALL');
    setClueDraft('');
    setPhoneticDraft('');
    
    if (currentIndex >= queue.length - 1) {
      setQueue([]);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentCard, clueDraft, phoneticDraft, currentIndex, queue.length, onUpdateItem]);

  const enterElaborationPhase = useCallback(() => {
    setPhase('ELABORATION');
    if (currentCard) {
        setClueDraft(currentCard.connectionHook);
        setPhoneticDraft(currentCard.phonetic || '');
    }
  }, [currentCard]);

  const handleRecallSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phase !== 'RECALL' || !currentCard) return;

    const isCorrect = inputValue.trim().toLowerCase() === currentCard.word.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        enterElaborationPhase();
      }, 600);
    } else {
      setFeedback('incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;

      if (phase === 'RECALL') {
        if (e.code === 'Space' && document.activeElement !== inputRef.current) {
           e.preventDefault();
           enterElaborationPhase();
        }
      } else if (phase === 'ELABORATION') {
        if (e.key === '1') handleRating(0);
        if (e.key === '2') handleRating(3);
        if (e.key === '3') handleRating(5);
        if (e.code === 'Space') {
            e.preventDefault();
            handleRating(4);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleRating, enterElaborationPhase]);

  const handleAiOptimize = async () => {
    if (!currentCard) return;
    setAiOptimizing(true);
    const result = await optimizeCardContent(currentCard.word, currentCard.definition);
    if (result) {
        setClueDraft(result.hook);
        setPhoneticDraft(result.phonetic);
    }
    setAiOptimizing(false);
  };

  const handlePlayAudio = async () => {
    if (audioLoading || !currentCard) return;
    setAudioLoading(true);
    const base64Audio = await generatePronunciation(currentCard.word);
    if (base64Audio) {
      playPcmAudio(base64Audio);
    }
    setAudioLoading(false);
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-sm">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
        <p className="text-gray-600 max-w-xs mx-auto">
          No cards due for review. Your memory traces are consolidating.
        </p>
      </div>
    );
  }

  const progressPercent = ((currentIndex) / queue.length) * 100;

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col w-full mr-4">
            <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                <span>Session Progress</span>
                <span>{currentIndex + 1} / {queue.length}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gray-900 transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
        <div className="flex flex-col items-end min-w-[60px]">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Memory</span>
             <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(lvl => (
                    <div 
                        key={lvl} 
                        className={`w-1.5 h-1.5 rounded-full ${currentCard.familiarityLevel >= lvl ? 'bg-green-500' : 'bg-gray-200'}`}
                    />
                ))}
             </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col relative">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col transition-all duration-500 min-h-[420px] relative">
          <div className="p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 flex-shrink-0 relative">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center">
                <Lightbulb size={12} className="mr-1" />
                Memory Hook
              </span>
              {phase === 'ELABORATION' && (
                <button 
                  onClick={handleAiOptimize}
                  disabled={aiOptimizing}
                  className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  {aiOptimizing ? 'Optimizing...' : 'AI Optimize'}
                </button>
              )}
            </div>
            
            {phase === 'RECALL' ? (
              <div className="min-h-[80px] flex items-center">
                  <p className="text-xl md:text-2xl font-serif text-gray-800 leading-relaxed text-center w-full">
                    {currentCard.connectionHook}
                  </p>
              </div>
            ) : (
              <TextArea 
                value={clueDraft} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClueDraft(e.target.value)}
                className="text-lg font-serif bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[80px] text-center w-full"
                placeholder="Refine your mnemonic here..."
              />
            )}
          </div>

          {phase === 'RECALL' && (
            <div className="flex-grow flex flex-col justify-center items-center p-8 animate-fade-in">
              <div className="w-full max-w-xs space-y-8">
                <form onSubmit={handleRecallSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    className={`w-full text-center text-3xl font-bold p-3 border-b-2 bg-transparent focus:outline-none transition-all placeholder-gray-200 font-serif
                      ${feedback === 'incorrect' ? 'border-red-500 text-red-600' : 'border-gray-200 focus:border-gray-900 text-gray-900'}
                      ${feedback === 'correct' ? 'border-green-500 text-green-600' : ''}
                      ${shake ? 'animate-shake' : ''}
                    `}
                    placeholder="Type word..."
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setInputValue(e.target.value);
                      if (feedback === 'incorrect') setFeedback('none');
                    }}
                    autoComplete="off"
                  />
                </form>
                <div className="flex justify-center">
                  <button 
                    onClick={() => enterElaborationPhase()}
                    className="group text-xs text-gray-400 hover:text-gray-600 flex items-center transition-colors px-4 py-2 rounded-full hover:bg-gray-50"
                  >
                    <span>Press Space to Reveal</span>
                    <Keyboard size={12} className="ml-2 opacity-50 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'ELABORATION' && (
            <div className="flex-grow flex flex-col p-6 animate-fade-in bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight font-serif">{currentCard.word}</h2>
                    {(phoneticDraft || currentCard.phonetic) && (
                        <span className="text-lg text-gray-400 font-mono tracking-wide">{phoneticDraft || currentCard.phonetic}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 italic font-serif mt-1 block">{currentCard.partOfSpeech}</span>
                </div>
                <button 
                  onClick={handlePlayAudio}
                  disabled={audioLoading}
                  className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:scale-105 transition-all active:scale-95"
                >
                  <Volume2 size={24} className={audioLoading ? 'animate-pulse text-indigo-600' : ''} />
                </button>
              </div>

              {currentCard.mnemonicImage && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <img src={`data:image/png;base64,${currentCard.mnemonicImage}`} alt="Mnemonic" className="w-full h-48 object-contain mix-blend-multiply" />
                  </div>
              )}

              <div className="space-y-4 flex-grow overflow-y-auto pr-1 no-scrollbar">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-900">
                  <p className="text-lg text-gray-800 font-medium leading-snug">{currentCard.definition}</p>
                </div>
                {currentCard.example && (
                  <div className="px-2">
                    <p className="text-gray-600 italic font-serif">"{currentCard.example}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {phase === 'ELABORATION' && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <button 
              onClick={() => handleRating(0)}
              className="group relative flex flex-col items-center justify-center p-3 bg-white border border-red-100 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 shadow-sm"
            >
              <Repeat size={20} className="mb-1" />
              <span className="text-xs font-bold">Forgot</span>
            </button>
            <button 
              onClick={() => handleRating(3)}
              className="group relative flex flex-col items-center justify-center p-3 bg-white border border-yellow-100 rounded-xl text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200 transition-all active:scale-95 shadow-sm"
            >
              <Award size={20} className="mb-1" />
              <span className="text-xs font-bold">Hard</span>
            </button>
            <button 
              onClick={() => handleRating(5)}
              className="group relative flex flex-col items-center justify-center p-3 bg-gray-900 border border-gray-900 rounded-xl text-white hover:bg-gray-800 transition-all active:scale-95 shadow-md"
            >
              <CheckCircle size={20} className="mb-1" />
              <span className="text-xs font-bold">Easy</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
