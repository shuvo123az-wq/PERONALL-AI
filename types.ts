
export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
}

export type Mood = 'Normal' | 'Happy' | 'Sad' | 'Tired' | 'Lonely' | 'Anxious';

export interface UserPreferences {
  name: string;
  language: 'Bangla' | 'English';
  goals: string[];
  currentMood: Mood;
}
