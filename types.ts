
export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string; // 音标 (New)
  definition: string; // 中文释义
  enDefinition?: string; // 英文释义
  partOfSpeech?: string; // 词性
  example?: string; // 例句
  synonyms?: string; // 近义词
  antonyms?: string; // 反义词
  connectionHook: string; // 助记/Clue
  createdAt: string;
  
  // Spaced Repetition System (SRS) fields
  familiarityLevel: number; // 0-5
  nextReview: string | null; // ISO Date string, null means new
  interval: number; // Days between reviews
  easeFactor: number; // For SM-2 algorithm (default 2.5)
  mnemonicImage?: string;
}

export enum ViewState {
  ADD_VOCAB = 'ADD_VOCAB',
  BATCH_IMPORT = 'BATCH_IMPORT',
  REVIEW = 'REVIEW',
  REPOSITORY = 'REPOSITORY'
}

export interface CsvRow {
  单词: string;
  音标?: string;
  释义: string;
  联系钩子: string;
  创建日期: string;
  熟悉度等级: number;
}
