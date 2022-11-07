import React, { useState, useEffect } from "react";
import { Pokemon } from "./Pokemon";
import "./App.css";
import {
  Guess,
  capitaliseName,
  displayAbilities,
  simplifyPokemonName,
  trimDescription
} from "./pokemonUtils.ts";

const enum Errors {
  FailedToFetch = "Failed to fetch a pokemon. Check your WiFi?"
}

const enum Notices {
  Right = "SUCCESS!! You got it in ",
  Wrong = "Incorrect :')",
  AttemptedGuessAfterSuccess = "You've already got it dude, take the win.",
  NoInputGuess = "Skipped",
  OutOfGuesses = "Aww, better luck next time! The correct answer was "
}

function App() {
  const [pokemon, setPokemon] = useState<Pokemon | undefined>(undefined);
  const [redactedDescription, setRedactedDescription] = useState("");
  const [guessNum, setGuessNum] = useState(1);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [outOfGuesses, setOutOfGuesses] = useState(false);
  const [guesses, setGuesses] = useState<Guess[]>([]);

  useEffect(() => {
    if (pokemon === undefined) {
      // const pokemonNumber = Math.floor(Math.random() * (807 - 1)) + 1;
      const pokemonNumber = 122;
      const link = "https://pokeapi.glitch.me/v1/pokemon/" + pokemonNumber;

      let request = new XMLHttpRequest();
      request.open("GET", link);
      // request.setRequestHeader("Access-Control-Allow-Origin", "*");
      try {
        request.send();
      } catch (e) {
        console.log(e);
        setError(Errors.FailedToFetch);
      }
      request.onload = () => {
        console.log(request);
        if (request.status === 200) {
          const pokemonResponse = JSON.parse(request.response);
          setPokemon(pokemonResponse[0]);
        } else {
          console.log(`error ${request.status} ${request.statusText}`);
          setError(Errors.FailedToFetch);
        }
      };
    } else {
      setRedactedDescription(trimDescription(pokemon));
    }
  }, [pokemon]);

  const submitGuess = () => {
    let input: HTMLInputElement = document.getElementById(
      "guess"
    ) as HTMLInputElement;
    const guess = input.value;
    input.value = "";
    console.log("user made the guess: ", guess, "for pokémon", pokemon.name);
    if (!correctGuess) {
      if (
        simplifyPokemonName(guess).toLocaleLowerCase() ===
        simplifyPokemonName(pokemon.name).toLocaleLowerCase()
      ) {
        console.log(guess, capitaliseName(guess));
        setGuesses(prevGuesses => [
          ...prevGuesses,
          { guess: capitaliseName(guess), correct: true }
        ]);
        setCorrectGuess(true);
        setNotice(Notices.Right + guessNum + "!");
      } else {
        if (guessNum >= 6) {
          setOutOfGuesses(true);
          setNotice(Notices.OutOfGuesses + pokemon.name + ".");
        } else {
          console.log(guess, capitaliseName(guess));
          setGuesses(prevGuesses => [
            ...prevGuesses,
            guess === ""
              ? { guess: Notices.NoInputGuess, correct: false }
              : { guess: capitaliseName(guess), correct: false }
          ]);
          setGuessNum(guessNum + 1);
          if (guess.length === 0) {
            setNotice(Notices.NoInputGuess);
          } else {
            setNotice(Notices.Wrong);
          }
        }
      }
    } else {
      setNotice(Notices.AttemptedGuessAfterSuccess);
    }
    setTimeout(() => {
      setNotice("");
    }, 5000);
  };

  const displayGuesses = () => {
    const guessList = guesses.map((guess: Guess, index: number) => {
      return (
        <p className="guess" key={index}>
          {guess.guess}
          {guess.correct ? " \u2611" : " \u2612"}
        </p>
      );
    });
    return guessList;
  };

  if (error) {
    return <div>{error}</div>;
  } else {
    return (
      <div className="App">
        <div className="toolbar">
          <h2>POKÉDLE</h2>
          <div
            className="info-button"
            onMouseEnter={() => setShowInfo(true)}
            onClick={() => setShowInfo(!showInfo)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <span>&#9432;</span>
          </div>
          {showInfo && (
            <div className="info popover">
              <p>
                Gender symbols in guesses have been replaced by M/F as
                appropriate. eg, `[pokemonName]M` will be accepted for
                `[pokemonName]♂`
              </p>
              <p>
                All other symbols will be ignored. eg, a pokemon name with a -
                will be accepted without the - included
              </p>
              <p>
                Pokémon with formes will have the formes dropped from their
                name. eg, `[pokemonName]` will be accepted for `[pokemonName] -
                [formeName]`
              </p>
            </div>
          )}
        </div>

        <div className="main-container">
          <p>{redactedDescription}</p>
          {guessNum >= 2 && (
            <p>
              {pokemon.height}, {pokemon.weight}
            </p>
          )}
          {guessNum >= 3 && <p>Gen {pokemon.gen}</p>}
          {guessNum >= 4 && (
            <p>
              Hidden Abilities: {displayAbilities(pokemon.abilities.hidden)}
            </p>
          )}
          {guessNum >= 5 && (
            <p>
              Normal Abilities: {displayAbilities(pokemon.abilities.normal)}
            </p>
          )}
          {guessNum >= 6 && <p>Species: {pokemon.species}</p>}
          <div className="guesses-list">
            <span>{displayGuesses()}</span>
          </div>
          <div className="input-div">
            <input
              type="text"
              id="guess"
              name="guess"
              onKeyDown={e => e.key === "Enter" && submitGuess()}
              autoComplete="off"
            ></input>
            <input
              className="input-button"
              type="submit"
              onClick={submitGuess}
              disabled={outOfGuesses}
            ></input>
          </div>
          {notice !== "" && (
            <div className="popover">
              <p>{notice}</p>
            </div>
          )}
          {(outOfGuesses || correctGuess) && (
            <img className="sprite" src={pokemon.sprite} alt={pokemon.name} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
