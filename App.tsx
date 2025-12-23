
import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Database, Menu, X, Layers } from 'lucide-react';
import { ViewState, VocabularyItem } from './types';
import { loadVocabulary, saveVocabulary } from './services/storage';
import { AddVocabulary } from './views/AddVocabulary';
import { BatchImport } from './views/BatchImport';
import { Review } from './views/Review';
import { Repository } from './views/Repository';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.REVIEW);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const data = loadVocabulary();
    setVocabulary(data);
  }, []);

  // Save data on change
  useEffect(() => {
    if (vocabulary.length > 0) {
      saveVocabulary(vocabulary);
    }
  }, [vocabulary]);

  const handleSaveItem = (item: VocabularyItem) => {
    setVocabulary(prev => [...prev, item]);
  };
  
  const handleBatchSave = (items: VocabularyItem[]) => {
    setVocabulary(prev => [...prev, ...items]);
  };

  const handleUpdateItem = (updatedItem: VocabularyItem) => {
    setVocabulary(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const NavItem = ({ targetView, icon: Icon, label }: { targetView: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(targetView);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
        view === targetView 
          ? 'bg-gray-900 text-white shadow-md' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={20} className="mr-3" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-10 flex items-center">
          <div className="w-8 h-8 bg-black rounded-lg mr-3 flex items-center justify-center text-white font-bold font-serif">I</div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">I Remembered</h1>
        </div>
        
        <nav className="flex-grow space-y-2">
          <NavItem targetView={ViewState.REVIEW} icon={BookOpen} label="开始复习 (Review)" />
          <NavItem targetView={ViewState.ADD_VOCAB} icon={PlusCircle} label="单词录入 (Single)" />
          <NavItem targetView={ViewState.BATCH_IMPORT} icon={Layers} label="批量生成 (Batch)" />
          <NavItem targetView={ViewState.REPOSITORY} icon={Database} label="我的仓库 (Data)" />
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <span className="font-bold text-lg">I Remembered</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-10 pt-20 px-6 md:hidden flex flex-col">
           <nav className="space-y-4 flex-grow">
            <NavItem targetView={ViewState.REVIEW} icon={BookOpen} label="开始复习" />
            <NavItem targetView={ViewState.ADD_VOCAB} icon={PlusCircle} label="单词录入" />
            <NavItem targetView={ViewState.BATCH_IMPORT} icon={Layers} label="批量生成" />
            <NavItem targetView={ViewState.REPOSITORY} icon={Database} label="我的仓库" />
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        <div className="flex-grow overflow-y-auto">
          {view === ViewState.ADD_VOCAB && <AddVocabulary onSave={handleSaveItem} />}
          {view === ViewState.BATCH_IMPORT && <BatchImport onSave={handleBatchSave} />}
          {view === ViewState.REVIEW && <Review items={vocabulary} onUpdateItem={handleUpdateItem} />}
          {view === ViewState.REPOSITORY && <Repository items={vocabulary} />}
        </div>
      </main>
    </div>
  );
};

export default App;
