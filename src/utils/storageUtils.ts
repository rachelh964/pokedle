import { StoredGuess } from "./guessUtils";
import { Score, defaultScore } from "./scoreUtils";
import { Theme, Themes } from "./themeUtils";

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
  return storedScore ? JSON.parse(storedScore) : defaultScore;
}

export const storeGuess = (guess: StoredGuess) => {
  localStorage.setItem("pokedle_todaysGuess", JSON.stringify(guess));
}

export const fetchGuessFromLocalStorage = (): StoredGuess | null => {
  const todaysGuess = localStorage.getItem("pokedle_todaysGuess");
  return todaysGuess ? JSON.parse(todaysGuess) : null;
}

export const storeTheme = (theme: Theme) => {
  localStorage.setItem("pokedle_theme", JSON.stringify(theme));
}

export const fetchThemeFromLocalStorage = (): Theme => {
  const theme = localStorage.getItem("pokedle_theme");
  return theme ? JSON.parse(theme) : Themes[0];
}