import data from './versets-coraniques.json';

export type Verset = {
  content: string;
  source: string;
};

export const VersetsCoraniques: Verset[] = data.versets;
