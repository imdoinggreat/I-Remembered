
import React, { useState } from 'react';
import { Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { Input, TextArea } from '../components/Input';
import { VocabularyItem } from '../types';
import { optimizeCardContent, generateMnemonicImage } from '../services/geminiService';

interface AddVocabularyProps {
  onSave: (item: VocabularyItem) => void;
}

export const AddVocabulary: React.FC<AddVocabularyProps> = ({ onSave }) => {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [hook, setHook] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const isValid = hook.trim().length >= 3 && word.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;

    const newItem: VocabularyItem = {
      id: crypto.randomUUID(),
      word: word.trim(),
      definition: definition.trim(),
      phonetic: phonetic.trim(),
      connectionHook: hook.trim(),
      createdAt: new Date().toISOString(),
      familiarityLevel: 0,
      nextReview: null,
      interval: 0,
      easeFactor: 2.5,
      mnemonicImage: generatedImage || undefined
    };

    onSave(newItem);
    setWord('');
    setDefinition('');
    setPhonetic('');
    setHook('');
    setGeneratedImage(null);
  };

  const handleAiInspiration = async () => {
    if (!word) return;
    setIsAiLoading(true);
    const result = await optimizeCardContent(word, definition);
    if (result) {
        setHook(prev => (prev ? prev + '\n' + result.hook : result.hook));
        if (!phonetic && result.phonetic) {
            setPhonetic(result.phonetic);
        }
    }
    setIsAiLoading(false);
  };

  const handleGenerateImage = async () => {
    if (!word) return;
    setIsImgLoading(true);
    const base64Data = await generateMnemonicImage(word, definition || hook);
    if (base64Data) {
      setGeneratedImage(base64Data);
    }
    setIsImgLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">添加生词 (Add New)</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="单词 / 短语" 
            placeholder="例如：Ephemeral"
            value={word}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWord(e.target.value)}
            autoFocus
          />
          <Input 
            label="音标 (Phonetic)" 
            placeholder="例如：/əˈfemərəl/"
            value={phonetic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhonetic(e.target.value)}
          />
        </div>
        
        <Input 
            label="释义" 
            placeholder="例如：朝生暮死的，短暂的"
            value={definition}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDefinition(e.target.value)}
        />

        <div className="flex-grow flex flex-col pt-4 min-h-[300px]">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-900">
              我怎么样才能记住？
            </label>
            <div className="flex gap-2">
               <button 
                onClick={handleGenerateImage}
                disabled={isImgLoading || !word}
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600 disabled:text-gray-300 transition-colors"
                title="生成记忆漫画"
              >
                <ImageIcon size={14} className="mr-1" />
                {isImgLoading ? '绘画中...' : '漫画生图'}
              </button>
              <button 
                onClick={handleAiInspiration}
                disabled={isAiLoading || !word}
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600 disabled:text-gray-300 transition-colors"
              >
                <Sparkles size={14} className="mr-1" />
                {isAiLoading ? '思考中...' : 'AI 启发 & 音标'}
              </button>
            </div>
          </div>
          
          <div className="relative flex-grow flex flex-col">
             <TextArea 
              placeholder="写下你的记忆钩子... (中英夹杂效果更好，至少3个字符)"
              value={hook}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHook(e.target.value)}
              className="text-lg leading-relaxed font-serif bg-gray-50 focus:bg-white h-32"
            />
            {generatedImage && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
                 <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs text-gray-400 font-bold uppercase">AI 记忆漫画</span>
                    <button onClick={() => setGeneratedImage(null)} className="text-xs text-red-400 hover:text-red-600">删除图片</button>
                 </div>
                 <img src={`data:image/png;base64,${generatedImage}`} alt="Mnemonic" className="w-full h-auto rounded" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
            className="w-full md:w-auto min-w-[120px]"
          >
            <Plus size={18} className="inline mr-2" />
            保存到仓库
          </Button>
        </div>
      </div>
    </div>
  );
};
