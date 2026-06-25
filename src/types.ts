export interface CustomBibleTab {
  id: string;
  label: string;
  content: string;
}

export interface BibleState {
  logline: string;
  story: string;
  world: string;
  system: string;
  item: string;
  character: string;
  villain: string;
  timeline: string;
  structure: string;
  episode: string;
  customTabs?: CustomBibleTab[];
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
