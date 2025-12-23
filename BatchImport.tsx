
import React, { useState } from 'react';
import { Layers, Loader } from 'lucide-react';
import { Button } from '../components/Button';
import { TextArea } from '../components/Input';
import { VocabularyItem } from '../types';
import { generateCardDetails } from '../services/geminiService';

interface BatchImportProps {
  onSave: (items: VocabularyItem[]) => void;
}

export const BatchImport: React.FC<BatchImportProps> = ({ onSave }) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const handleImport = async () => {
    const words = rawText.split(/\n/).map(w => w.trim()).filter(w => w.length > 0);
    
    if (words.length === 0) {
      alert("请先输入单词列表");
      return;
    }

    if (words.length > 50) {
      if(!confirm(`你输入了 ${words.length} 个单词。为了演示稳定性，建议分批处理。是否继续？`)) {
        return;
      }
    }

    setIsProcessing(true);
    setLogs([]);
    setProgress({ current: 0, total: words.length });

    const newItems: VocabularyItem[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      try {
        setLogs(prev => [`正在生成: ${word}...`, ...prev]);
        const details = await generateCardDetails(word);
        
        if (details) {
          newItems.push({
            id: crypto.randomUUID(),
            word: word,
            phonetic: details.phonetic,
            definition: details.definition,
            connectionHook: details.connectionHook,
            createdAt: new Date().toISOString(),
            familiarityLevel: 0,
            nextReview: null,
            interval: 0,
            easeFactor: 2.5
          });
          setLogs(prev => [`✅ 完成: ${word}`, ...prev]);
        } else {
          setLogs(prev => [`❌ 失败: ${word}`, ...prev]);
        }
      } catch (e) {
        setLogs(prev => [`❌ 错误: ${word}`, ...prev]);
      }
      setProgress({ current: i + 1, total: words.length });
    }

    if (newItems.length > 0) {
      onSave(newItems);
      setLogs(prev => [`🎉 全部完成！成功导入 ${newItems.length} 个单词。`, ...prev]);
      setRawText('');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-full p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">批量生成 (Batch Gen)</h2>
        <p className="text-sm text-gray-500 mb-4">
          粘贴你的单词列表（每行一个）。AI 将自动生成释义、音标和记忆线索。
        </p>
        
        <div className="flex-grow min-h-[300px] mb-4">
          <TextArea 
            placeholder={`例如：\nAbate\nAbdicate\nAberrant\n...`}
            value={rawText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawText(e.target.value)}
            disabled={isProcessing}
            className="font-mono text-sm"
          />
        </div>

        <Button 
          onClick={handleImport} 
          disabled={isProcessing || !rawText}
          className="w-full flex justify-center items-center"
        >
          {isProcessing ? <Loader className="animate-spin mr-2" size={18}/> : <Layers className="mr-2" size={18}/>}
          {isProcessing ? `生成中 (${progress.current}/${progress.total})` : '开始 AI 生成'}
        </Button>
      </div>

      <div className="md:w-1/3 bg-black rounded-lg p-4 flex flex-col font-mono text-xs overflow-hidden shadow-lg border border-gray-800">
        <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
          <span className="text-gray-400 font-bold uppercase tracking-wider">System Log</span>
          {isProcessing && <span className="text-green-400 animate-pulse">● Live</span>}
        </div>
        
        <div className="flex-grow overflow-y-auto text-gray-300 space-y-1 scrollbar-thin scrollbar-thumb-gray-700">
          {logs.length === 0 && (
            <div className="text-gray-600 italic mt-4 text-center">等待任务...</div>
          )}
          {logs.map((log, idx) => (
            <div key={idx} className={`
              ${log.includes('✅') ? 'text-green-400' : ''}
              ${log.includes('❌') ? 'text-red-400' : ''}
              ${log.includes('正在') ? 'text-blue-400' : ''}
            `}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
