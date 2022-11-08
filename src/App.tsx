import React, { useState, useEffect } from "react";
import { PokemonNew, PokemonSpecies } from "./Pokemon";
import "./App.css";
import {
  Guess,
  capitaliseName,
  displayAbilities,
  simplifyPokemonName,
  trimDescription
  //@ts-ignore
} from "./utils/pokemonUtils.ts";
//@ts-ignore
import { fetchPokemonNew, fetchPokemonSpecies } from "./utils/fetchUtils.ts";
import SearchableDropdown from "./components/SearchableDropdown";

const enum Notices {
  Right = "SUCCESS!! You got it in ",
  Wrong = "Incorrect :')",
  AttemptedGuessAfterSuccess = "You've already got it dude, take the win.",
  NoInputGuess = "Skipped",
  OutOfGuesses = "Aww, better luck next time! The correct answer was "
}

function App() {
  const [pokemon, setPokemon] = useState<PokemonNew | undefined>(undefined);
  const [pokemonSpecies, setPokemonSpecies] = useState<
    PokemonSpecies | undefined
  >(undefined);
  const [pokemonNumber, setPokemonNumber] = useState(0);
  const [pokemonName, setPokemonName] = useState("");
  const [redactedDescription, setRedactedDescription] = useState("");
  const [guessNum, setGuessNum] = useState(1);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [outOfGuesses, setOutOfGuesses] = useState(false);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [sprite, setSprite] = useState<string | null>(null);
  const [pokemonFetched, setPokemonFetched] = useState(false);
  const [pokemonSpeciesFetched, setPokemonSpeciesFetched] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState("");
  const listOfPokemonNames = (localStorage.getItem("pokemonNames") || "").replace(/[/"/[/]]/g, "").split(',');
  console.log(listOfPokemonNames, typeof listOfPokemonNames)

  useEffect(() => {
    if (pokemonNumber === 0) {
      // const pokemonNumber = Math.floor(Math.random() * (807 - 1)) + 1;
      setPokemonNumber(122);
    }
    if (!pokemonFetched && pokemonNumber !== 0) {
      fetchPokemonNew(pokemonNumber, setError).then(data => setPokemon(data));
      setPokemonFetched(true);
    } else if (
      pokemon !== undefined &&
      !pokemonSpeciesFetched &&
      pokemonNumber !== 0
    ) {
      fetchPokemonSpecies(pokemonNumber, setError).then(data =>
        setPokemonSpecies(data)
      );
      setPokemonSpeciesFetched(true);
    } else if (
      pokemonSpecies !== undefined &&
      pokemon !== undefined &&
      pokemonNumber !== 0
    ) {
      //** Everything's fetched, so set the necessary values */
      pokemonSpecies.names.some(pokeName => {
        if (pokeName.language.name === "en") {
          setPokemonName(pokeName.name);
          return true;
        }
        return false;
      });
      setRedactedDescription(trimDescription(pokemonSpecies));
      setSprite(pokemon.sprites.other.officialArtwork.officialArtwork);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon, pokemonSpecies, pokemonNumber]);

  const submitGuess = () => {
    let input: HTMLInputElement = document.getElementById(
      "guess"
    ) as HTMLInputElement;
    const guess = input.value;
    input.value = "";
    console.log("user made the guess: ", guess, "for pokémon", pokemonName);
    console.log(simplifyPokemonName(guess).toLocaleLowerCase(),
      simplifyPokemonName(pokemon?.name).toLocaleLowerCase())
    if (!correctGuess) {
      if (
        simplifyPokemonName(guess).toLocaleLowerCase() ===
        simplifyPokemonName(pokemon?.name).toLocaleLowerCase()
      ) {
        setGuesses(prevGuesses => [
          ...prevGuesses,
          { guess: pokemonName, correct: true }
        ]);
        setCorrectGuess(true);
        setNotice(Notices.Right + guessNum + "!");
      } else {
        if (guessNum >= 6) {
          setOutOfGuesses(true);
          setNotice(Notices.OutOfGuesses + pokemonName + ".");
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
              <p>Data provided by pokedex-api</p>
            </div>
          )}
        </div>

        <div className="main-container">
          <p>{redactedDescription}</p>
          {guessNum >= 2 && (
            <p>
              {pokemon?.height}, {pokemon?.weight}
            </p>
          )}
          {guessNum >= 3 && <p>Gen {pokemonSpecies?.generation.name}</p>}
          {guessNum >= 4 && (
            <p>
              Hidden Abilities:{" "}
              {pokemon?.abilities && displayAbilities(pokemon.abilities, true)}
            </p>
          )}
          {guessNum >= 5 && (
            <p>
              Normal Abilities:{" "}
              {pokemon?.abilities && displayAbilities(pokemon.abilities, false)}
            </p>
          )}
          {guessNum >= 6 && <p>Species: {pokemonSpecies?.genera?.genus}</p>}
          <div className="guesses-list">
            <span>{displayGuesses()}</span>
          </div>
          <div className="input-div">
            {(listOfPokemonNames && listOfPokemonNames.length > 2) ? (
              <SearchableDropdown
                options={listOfPokemonNames}
                id="guess"
                selectedGuess={selectedGuess}
                handleChange={(sel) => setSelectedGuess(sel)}
                onKeyDown={e => e.key === "Enter" && submitGuess()}
              />) : (
              <input
                type="text"
                id="guess"
                name="guess"
                onKeyDown={e => e.key === "Enter" && submitGuess()}
                autoComplete="off"
              ></input>
            )}
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
            <img className="sprite" src={sprite || ""} alt={pokemonName} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
