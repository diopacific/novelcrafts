export interface BibleState {
  logline: string;
  story: string;
  world: string;
  system: string;
  character: string;
  villain: string;
  structure: string;
  episode: string;
}

export interface Episode {
  id: string;
  number: number;
  direction: string;
  content: string;
  summary: string;
  authorNote?: string;
  status?: 'draft' | 'revision' | 'completed';
}
