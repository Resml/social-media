export interface AIHistoryItem {
  id: string;
  title: string;
  contentType: string;
  tone: string;
  language: string;
  generatedContent: string;
  createdAt: string;
}

const STORAGE_KEY = 'socialhub_ai_history';

export const AIHistoryService = {
  getHistory: async (): Promise<AIHistoryItem[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to fetch AI history:", error);
      return [];
    }
  },

  addToHistory: async (item: Omit<AIHistoryItem, 'id' | 'createdAt'>): Promise<AIHistoryItem> => {
    const newItem: AIHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    try {
      const history = await AIHistoryService.getHistory();
      const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50 items
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return newItem;
    } catch (error) {
      console.error("Failed to add to AI history:", error);
      return newItem;
    }
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    try {
      const history = await AIHistoryService.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  },

  clearHistory: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
