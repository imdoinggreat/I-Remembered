
import { VocabularyItem, CsvRow } from '../types';
import { INITIAL_DATA } from './initialData';

const STORAGE_KEY = 'my_vocab_db';

export const loadVocabulary = (): VocabularyItem[] => {
  let localItems: VocabularyItem[] = [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      localItems = JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load vocabulary", e);
  }

  // --- Data Merge Strategy ---
  // If local storage exists, we want to keep user's progress (SRS stats).
  // But we also want to add any new words that might have been added to INITIAL_DATA code.
  
  const localMap = new Map(localItems.map(item => [item.word.toLowerCase(), item]));
  const mergedItems = [...localItems];
  let hasNewItems = false;

  INITIAL_DATA.forEach(seedItem => {
    // If the word doesn't exist in local storage, add it.
    if (!localMap.has(seedItem.word.toLowerCase())) {
      mergedItems.push(seedItem);
      hasNewItems = true;
    }
  });

  // If we added new items or if local was empty, save the merged state
  if (hasNewItems || localItems.length === 0) {
    // Check if it's a fresh install (localItems is empty)
    // If fresh, use the shuffled INITIAL_DATA directly to ensure randomness
    const finalData = localItems.length === 0 ? INITIAL_DATA : mergedItems;
    saveVocabulary(finalData);
    return finalData;
  }

  return localItems;
};

export const saveVocabulary = (items: VocabularyItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save vocabulary", e);
  }
};

// Simple CSV Generator to avoid heavy dependencies for MVP
export const generateCSV = (items: VocabularyItem[]): string => {
  const headers = ['单词', '音标', '释义', '联系钩子', '创建日期', '熟悉度等级'];
  const rows = items.map(item => [
    `"${item.word.replace(/"/g, '""')}"`,
    `"${(item.phonetic || '').replace(/"/g, '""')}"`,
    `"${item.definition.replace(/"/g, '""')}"`,
    `"${item.connectionHook.replace(/"/g, '""')}"`,
    `"${item.createdAt}"`,
    item.familiarityLevel
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const downloadCSV = (content: string, filename: string = 'my_vocab.csv') => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadMarkdown = (items: VocabularyItem[], filename: string = 'my_vocab.md') => {
  let content = '# 我的单词库 (My Vocabulary)\n\n';
  
  // Sort by date descending for markdown export usually looks better
  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  sorted.forEach(item => {
    content += `## ${item.word}\n\n`;
    if (item.phonetic) content += `*${item.phonetic}*\n\n`;
    content += `**释义**: ${item.definition}\n\n`;
    content += `> **我的联系**: ${item.connectionHook}\n\n`;
    content += `---\n\n`;
  });

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
