import data from './conseils-sante.json';

export type Conseil = {
  content: string;
  source: string;
};

export const ConseilsSante: Conseil[] = data.conseils;
