import { getFormattedDate } from "./dateUtils";

export interface Guess {
  guess: string;
  correct: boolean;
}

export interface StoredGuess {
  number: number;
  date: string;
  guesses: Guess[];
}

export const formatGuesses = (guesses: Guess[], pokemonNumber: number, guess?: Guess): StoredGuess => {
  const guessesToStore = guesses;
  guess && guessesToStore.push(guess);
  return {
    date: getFormattedDate(new Date()),
    number: pokemonNumber,
    guesses: guessesToStore
  };
};