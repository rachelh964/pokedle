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

interface NameWithURL {
  name: string;
  url: string;
}

interface FlavorText {
  flavorText: string;
  language: NameWithURL;
  version: NameWithURL;
}

interface Genus {
  genus: string;
  language: NameWithURL;
}

export interface Name {
  language: NameWithURL;
  name: string;
}

interface PalParkEncounter {
  area: NameWithURL;
  baseScore: number;
  rate: number;
}

interface PokedexNumber {
  entryNumber: number;
  pokedex: NameWithURL;
}

interface Variety {
  isDefault: boolean;
  pokemon: NameWithURL;
}

export interface PokemonSpecies {
  baseHappiness: number;
  captureRate: number;
  color: NameWithURL;
  eggGroups: NameWithURL;
  evolutionChain: { url: string };
  evolvesFromSpecies: NameWithURL;
  flavorTextEntries: FlavorText[];
  formDescriptions: string[];
  formsSwitchable: boolean;
  genderRate: number;
  genera: Genus[];
  generation: NameWithURL;
  growthRate: NameWithURL;
  habitat: NameWithURL;
  hasGenderDifferences: boolean;
  hatchCounter: number;
  id: number;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  name: string;
  names: Name[];
  order: number;
  palParkEncounters: PalParkEncounter[];
  pokedexNumbers: PokedexNumber[];
  shape: NameWithURL;
  varieties: Variety[];
}

export interface Ability {
  ability: NameWithURL;
  isHidden: boolean;
  slot: number;
}

interface GameIndex {
  gameIndex: number;
  version: NameWithURL;
}

interface VersionDetail {
  rarity: number;
  version: NameWithURL;
}

interface Item {
  item: NameWithURL;
  versionDetails: VersionDetail[];
}

interface VersionGroupDetail {
  levelLearnedAt: number;
  moveLearnMethod: NameWithURL;
  versionGroup: NameWithURL;
}

interface Move {
  move: NameWithURL;
  versionGroupDetails: VersionGroupDetail[];
}

interface Type {
  slot: number;
  type: NameWithURL;
}

interface PastType {
  generation: NameWithURL;
  types: Type[];
}

interface OtherSprites {
  dreamWorld: BattleSprites;
  home: BattleSprites;
  officialArtwork: { frontDefault: string | null };
}

interface BattleSprites {
  animated?: BattleSprites | null;
  backDefault?: string | null;
  backFemale?: string | null;
  backGray?: string | null;
  backShiny?: string | null;
  backShinyFemale?: string | null;
  backShinyTransparent?: string | null;
  backTransparent?: string | null;
  frontDefault?: string | null;
  frontFemale?: string | null;
  frontShiny?: string | null;
  frontShinyFemale?: string | null;
  frontShinyTransparent?: string | null;
  frontGray?: string | null;
  frontTransparent?: string | null;
}

interface VersionsSprites {
  generationI: { redBlue: BattleSprites; yellow: BattleSprites };
  generationII: {
    crystal: BattleSprites;
    gold: BattleSprites;
    silver: BattleSprites;
  };
  generationIII: {
    emerald: BattleSprites;
    fireredLeafgreen: BattleSprites;
    rubySapphire: BattleSprites;
  };
  generationIV: {
    diamondPearl: BattleSprites;
    heartgoldSoulsilver: BattleSprites;
    platinum: BattleSprites;
  };
  generationV: {
    blackWhite: BattleSprites;
    gold: BattleSprites;
    silver: BattleSprites;
  };
  generationVI: {
    omegarubyAlphasapphire: BattleSprites;
    xY: BattleSprites;
  };
  generationVII: {
    icons: BattleSprites;
    ultraSunUltraMoon: BattleSprites;
  };
  generationVIII: {
    icons: BattleSprites;
  };
}

interface Sprites {
  backDefault: string | null;
  backFemale: string | null;
  backShiny: string | null;
  backShinyFemale: string | null;
  frontDefault: string | null;
  frontFemale: string | null;
  frontShiny: string | null;
  frontShinyFemale: string | null;
  other: OtherSprites;
  versions: VersionsSprites;
}

interface Stat {
  baseStat: number;
  effort: number;
  stat: NameWithURL;
}

export interface PokemonNew {
  abilities: Ability[];
  baseExperience: number;
  forms: NameWithURL[];
  gameIndices: GameIndex[];
  height: number;
  heldItems: Item[];
  id: number;
  isDefault: boolean;
  locationAreaEncounters: string;
  moves: Move[];
  name: string;
  order: number;
  pastTypes: PastType[];
  species: NameWithURL;
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number;
}
