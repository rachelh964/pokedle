interface Family {
  evolutionLine: string[];
  evolutionStage: number;
  id: number;
}

interface Abilities {
  hidden: string[];
  normal: string[];
}

export interface Pokemon {
  abilities: Abilities;
  description: string;
  eggGroups: string[];
  family: Family;
  gen: number;
  gender: string[];
  height: string;
  legendary: boolean;
  mega: boolean;
  mythical: boolean;
  name: string;
  number: string;
  species: string;
  sprite: string;
  starter: boolean;
  types: string[];
  ultraBeast: boolean;
  weight: string;
}
