
export interface CodeState {
  html: string;
  css: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}

export interface Template {
  name: string;
  html: string;
  css: string;
}
