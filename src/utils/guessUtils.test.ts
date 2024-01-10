import { getFormattedDate } from "./dateUtils";
import { Guess, formatGuesses } from "./guessUtils";

export const dummyGuesses: Guess[] = [{ guess: "", correct: false }, { guess: "Bulbasaur", correct: false }];
export const dummyGuess: Guess = { guess: "Charmander", correct: true };

describe("GuessUtils", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should return correctly formatted guess obj with an empty array of guesses", () => {
    expect(formatGuesses([], 1)).toEqual({ date: getFormattedDate(new Date()), number: 1, guesses: [] });
  });

  it("should return correctly formatted guess obj with an array of guesses", () => {
    expect(formatGuesses(dummyGuesses, 4)).toEqual({ date: getFormattedDate(new Date), number: 4, guesses: dummyGuesses });
  });

  it("should return correctly formatted guess obj with an array of guesses and an additional guess", () => {
    const allGuesses = dummyGuesses;
    allGuesses.push(dummyGuess);
    expect(formatGuesses(dummyGuesses, 4, dummyGuess)).toEqual({ date: getFormattedDate(new Date), number: 4, guesses: allGuesses });
  });
});