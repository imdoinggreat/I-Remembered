import React, { useMemo, useState } from 'react';
import { Download, FileText, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/Button';
import { VocabularyItem } from '../types';
import { generateCSV, downloadCSV, downloadMarkdown } from '../services/storage';

interface RepositoryProps {
  items: VocabularyItem[];
}

export const Repository: React.FC<RepositoryProps> = ({ items }) => {
  const [sortDesc, setSortDesc] = useState(true);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortDesc ? timeB - timeA : timeA - timeB;
    });
  }, [items, sortDesc]);

  const handleExportCSV = () => {
    const csvContent = generateCSV(items);
    downloadCSV(csvContent);
  };

  const handleExportMD = () => {
    downloadMarkdown(items);
  };

  return (
    <div className="max-w-5xl mx-auto h-full p-6 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Repository</h2>
          <p className="text-gray-500 text-sm mt-1">{items.length} items stored locally</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportMD} className="flex items-center text-xs md:text-sm">
            <FileText size={16} className="mr-2" />
            Export Markdown
          </Button>
          <Button variant="secondary" onClick={handleExportCSV} className="flex items-center text-xs md:text-sm">
            <Download size={16} className="mr-2" />
            Backup CSV
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Word</div>
          <div className="col-span-4">Definition</div>
          <div className="col-span-3">Connection</div>
          <div 
            className="col-span-2 cursor-pointer hover:text-gray-700 flex items-center justify-end md:justify-start"
            onClick={() => setSortDesc(!sortDesc)}
          >
            Date <ArrowUpDown size={12} className="ml-1" />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-grow no-scrollbar">
          {sortedItems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Your repository is empty.
            </div>
          ) : (
            sortedItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 transition-colors p-4 text-sm text-gray-800 last:border-0">
                <div className="col-span-3 font-medium truncate pr-2" title={item.word}>{item.word}</div>
                <div className="col-span-4 text-gray-600 truncate pr-2" title={item.definition}>{item.definition}</div>
                <div className="col-span-3 text-gray-500 italic truncate pr-2" title={item.connectionHook}>{item.connectionHook}</div>
                <div className="col-span-2 text-gray-400 text-xs flex items-center justify-end md:justify-start">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};