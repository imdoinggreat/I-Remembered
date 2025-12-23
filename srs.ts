import { VocabularyItem } from '../types';

// Simple implementation of SM-2 Algorithm
// Quality: 0 (Forgot), 3 (Hard), 4 (Good), 5 (Easy)

export const calculateNextReview = (item: VocabularyItem, quality: number): VocabularyItem => {
  let { interval, easeFactor, familiarityLevel } = item;

  // If quality is low (forgot), reset interval
  if (quality < 3) {
    interval = 1;
    familiarityLevel = 0;
  } else {
    // Update familiarity for UI/Sorting
    familiarityLevel = Math.min(5, familiarityLevel + 1);

    // Calculate new interval
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...item,
    interval,
    easeFactor,
    familiarityLevel,
    nextReview: nextReviewDate.toISOString()
  };
};

export const getDueItems = (items: VocabularyItem[]): VocabularyItem[] => {
  const now = new Date().getTime();
  return items.filter(item => {
    // If never reviewed or date is passed
    return !item.nextReview || new Date(item.nextReview).getTime() <= now;
  }).sort((a, b) => {
    // Prioritize items that are most overdue
    const dateA = a.nextReview ? new Date(a.nextReview).getTime() : 0;
    const dateB = b.nextReview ? new Date(b.nextReview).getTime() : 0;
    return dateA - dateB;
  });
};