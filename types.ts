
export type Category = 'Amigo' | 'Família' | 'Trabalho' | 'Igreja' | 'Outro';

export interface Birthday {
  id: string;
  name: string;
  date: string; // ISO string YYYY-MM-DD
  observation?: string;
  category: Category;
  emoji: string;
}

export interface Settings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  notifyDayBefore: boolean;
}
