import { Score, defaultScore } from "./scoreUtils";

export const storePokemonNames = (pokemonArray: string[]): void => {
  localStorage.setItem(
    "pokedle_pokemonNames",
    JSON.stringify(pokemonArray)
  );
  console.log("stored pokemon names to localStorage");
}

export const fetchPokemonNamesFromStorage = (): string[] => {
  const storedNames = localStorage.getItem("pokedle_pokemonNames");
  if (storedNames && storedNames.length > 1) {
    console.log("fetching pokemon names from localStorage");
    return JSON.parse(storedNames);
  } else {
    return [];
  }
}

export const storeScore = (score: Score) => {
  localStorage.setItem(
    "pokedle_score",
    JSON.stringify(score)
  );
}

export const fetchScoreFromLocalStorage = (): Score => {
  const storedScore = localStorage.getItem("pokedle_score");
  if (storedScore) {
    return JSON.parse(storedScore);
  } else {
    return defaultScore;
  }
}