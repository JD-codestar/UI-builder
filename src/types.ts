export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  steps?: { title: string; status: 'pending' | 'running' | 'completed' }[];
  filesCreated?: ProjectFile[];
}

export interface Model {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badge?: string;
}
