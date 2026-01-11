
export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
}

export interface UserPreferences {
  name: string;
  language: 'Bangla' | 'English';
  goals: string[];
}
