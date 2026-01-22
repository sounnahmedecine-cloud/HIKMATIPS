import data from './hadiths.json';

export type Hadith = {
  content: string;
  source: string;
};

export const Hadiths: Hadith[] = data.hadiths;
