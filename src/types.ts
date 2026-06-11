export interface BibleState {
  story: string;
  world: string;
  system: string;
  character: string;
  villain: string;
  structure: string;
}

export interface Episode {
  id: string;
  number: number;
  direction: string;
  content: string;
  summary: string;
}
