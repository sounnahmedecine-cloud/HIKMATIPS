import data from './conseils-bien-etre-sport.json';

export type Conseil = {
  content: string;
  source: string;
};

export const ConseilsBienEtreSport: Conseil[] = data.conseils;
