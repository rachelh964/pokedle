import { Score } from "./scoreUtils";

export const storePokemonNames = (pokemonArray: string[]): void => {
  localStorage.setItem(
    "pokedle_pokemonNames",
    JSON.stringify(pokemonArray)
  );
  console.log("stored pokemon names to localStorage");
}

export const fetchPokemonNamesFromStorage = (): string[] => {
  const storedNames = localStorage.getItem("pokedle_pokemonNames");
  if (storedNames && storedNames.length > 100) {
    console.log("fetching pokemon names from localStorage");
    return JSON.parse(storedNames);
  } else {
    return [];
  }
}

export const fetchScoreFromLocalStorage = (): Score => {
  const storedScore = localStorage.getItem("pokedle_score");
  if (storedScore) {
    return JSON.parse(storedScore);
  } else {
    return {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "played": 0,
      "winTotal": 0,
      "winPercentage": 0,
      "currentStreak": 0,
      "maxStreak": 0
    }
  }
}