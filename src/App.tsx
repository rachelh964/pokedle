import React, { useState, useEffect, useCallback, useRef } from "react";
import { PokemonNew, PokemonSpecies } from "./Pokemon";
import "./App.css";
//@ts-ignore
import { getFormattedDate } from "./utils/dateUtils.ts";
import {
  Guess,
  displayAbilities,
  fetchAllPokemonNames,
  simplifyPokemonName,
  trimDescription
  //@ts-ignore
} from "./utils/pokemonUtils.ts";
//@ts-ignore
import { fetchPokemonNew, fetchPokemonSpecies } from "./utils/fetchUtils.ts";
import SearchableDropdown from "./components/SearchableDropdown";

import lottie from "lottie-web";
import lottieAnimation from "./assets/loading-lottie.json";

const enum Notices {
  Right = "SUCCESS!! You got it in ",
  Wrong = "Incorrect :')",
  AttemptedGuessAfterSuccess = "You've already got it dude, take the win.",
  NoInputGuess = "Skipped",
  OutOfGuesses = "Aww, better luck next time! The correct answer was ",
  AttemptedGuessAfterFailure = "Sorry, you're out of guesses. Try out practice mode, or come back tomorrow!",
}

interface StoredGuess {
  number: number;
  date: string;
  guesses: Guess[];
}

function App() {
  const [isDailyVersion, setIsDailyVersion] = useState<boolean>(true);
  const [pokemon, setPokemon] = useState<PokemonNew | undefined>(undefined);
  const [pokemonSpecies, setPokemonSpecies] = useState<
    PokemonSpecies | undefined
  >(undefined);
  const [pokemonNumber, setPokemonNumber] = useState(0);
  const [pokemonName, setPokemonName] = useState("");
  const [redactedDescription, setRedactedDescription] = useState("");
  const [correctGuess, setCorrectGuess] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [outOfGuesses, setOutOfGuesses] = useState(false);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [sprite, setSprite] = useState<string | null>(null);
  const [generation, setGeneration] = useState<string | null>(null);
  const [species, setSpecies] = useState<string | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [weight, setWeight] = useState<string | null>(null);

  const [pokemonFetched, setPokemonFetched] = useState(false);
  const [pokemonSpeciesFetched, setPokemonSpeciesFetched] = useState(false);
  const [pokemonListFetched, setPokemonListFetched] = useState(false);

  const [selectedGuess, setSelectedGuess] = useState("");
  const [listOfPokemonNames, setListOfPokemonNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      if (pokemonFetched && pokemonSpeciesFetched && pokemonListFetched) {
        setIsLoading(false);
      }
    }, 2000);
  }, [pokemonFetched, pokemonSpeciesFetched, pokemonListFetched]);

  useEffect(() => {
    if (listOfPokemonNames && listOfPokemonNames.length < 100) {
      fetchAllPokemonNames().then((list: string[]) => {
        setTimeout(() => {
          if (list && list.length > 100) {
            setListOfPokemonNames(list.toString()
              .replace(/[[\]"]+/g, "")
              .split(","));
            setPokemonListFetched(true);
          }
        }, 2000);
      });
    }
  }, [listOfPokemonNames])

  useEffect(() => {
    const element = document.getElementById("loader");
    if (element) {
      lottie.loadAnimation({
        container: element, // the dom element that will contain the animation
        renderer: 'svg',
        animationData: lottieAnimation // the path to the animation json
      });
    }
  }, []);

  useEffect(() => {
    console.log(pokemonNumber, "pokemon number", listOfPokemonNames, pokemonListFetched);
    if (!pokemonListFetched || listOfPokemonNames.length < 100) {
      console.log("waiting for pokemon list to be fetched...");
    } else {
      const pokemonCount = listOfPokemonNames.length;
      if (pokemonNumber === 0) {
        if (isDailyVersion) {
          // const fetchNum = async () => {
          //   setPokemonNumber(await fetchNumber());
          // }
          // fetchNum();
          const nowDate: Date = new Date();
          nowDate.setHours(0, 0, 0, 0);
          const prevGuess: StoredGuess | null = JSON.parse(
            localStorage.getItem("pokedle_prevGuess")
          );
          const prevGuessTime: string | null = prevGuess && prevGuess.date;
          if (prevGuessTime !== null) {
            const prevDate = new Date(prevGuessTime);
            prevDate.setHours(0, 0, 0, 0);
            if (prevGuess && nowDate.valueOf() === prevDate.valueOf()) {
              setPokemonNumber(prevGuess.number);
            } else {
              const newPokemon = Math.floor(Math.random() * (pokemonCount - 1)) + 1;
              setPokemonNumber(newPokemon);
              console.log("storing prevGuess in prevGuess doesn't exist or date is different", newPokemon);
              localStorage.setItem("pokedle_prevGuess", JSON.stringify({ number: newPokemon, date: getFormattedDate(new Date()), guesses: [] }));
            }
          } else {
            const newPokemon = Math.floor(Math.random() * (pokemonCount - 1)) + 1;
            setPokemonNumber(newPokemon);
            console.log("storing prevGuess in no prev guess time", newPokemon);
            localStorage.setItem("pokedle_prevGuess", JSON.stringify({ number: newPokemon, date: getFormattedDate(new Date()), guesses: [] }))
          }
        } else {
          setPokemonNumber(Math.floor(Math.random() * (pokemonCount - 1)) + 1);
          // setPokemonNumber(128);
        }
      }
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
      pokemonNumber !== 0 &&
      pokemonListFetched
    ) {
      //** Everything's fetched, so set the necessary values */
      pokemonSpecies.names.some(pokeName => {
        if (pokeName.language.name === "en") {
          setPokemonName(pokeName.name);
          return true;
        }
        return false;
      });
      if (redactedDescription === "") {
        setRedactedDescription(trimDescription(pokemonSpecies, listOfPokemonNames));
      }
      setSprite(pokemon.sprites.other.officialArtwork.frontDefault);
      const gen = pokemonSpecies.generation.url.split("/");
      setGeneration(gen[gen.length - 2]);
      pokemonSpecies.genera.some(genus => {
        if (genus.language.name === "en") {
          setSpecies(genus.genus);
          return true;
        }
        return false;
      });
      const inches = (pokemon.height / 10) * 39.37;
      const feet = Math.floor(inches / 12);
      setHeight(
        pokemon.height / 10 +
        "m (" +
        feet +
        "ft " +
        Math.round(inches - feet * 12) +
        "in)"
      );
      setWeight(
        pokemon.weight / 10 +
        "kg (" +
        Math.round((pokemon.weight / 10) * 2.2) +
        "lbs)"
      );
      console.log("Hello", pokemon, pokemonSpecies);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon, pokemonSpecies, pokemonNumber, listOfPokemonNames, pokemonListFetched, isDailyVersion]);

  const reset = () => {
    setPokemon(undefined);
    setRedactedDescription("");
    setPokemonSpecies(undefined);
    setPokemonNumber(0);
    setCorrectGuess(false);
    setOutOfGuesses(false);
    setGuesses([]);
    setSprite(null);
    setGeneration(null);
    setSpecies(null);
    setHeight(null);
    setWeight(null);
    setPokemonFetched(false);
    setPokemonSpeciesFetched(false);
    setSelectedGuess("");
  };

  const submitGuess = () => {
    let input: HTMLInputElement = document.getElementById(
      "guess"
    ) as HTMLInputElement;
    const guess = input.value;
    input.value = "";
    console.log("user made the guess: ", guess, "for pokémon", pokemonName);
    if (!correctGuess) {
      let guessToStore: { guess: string; correct: boolean };
      if (
        simplifyPokemonName(guess).toLocaleLowerCase() ===
        (simplifyPokemonName(pokemonName).toLocaleLowerCase() ||
          simplifyPokemonName(pokemon?.name).toLocaleLowerCase())
      ) {
        guessToStore = { guess: pokemonName, correct: true };
        setGuesses(prevGuesses => [...prevGuesses, guessToStore]);
        setCorrectGuess(true);
        storeGuess(guessToStore);
        setNotice(Notices.Right + guesses.length + "!");
      } else {
        if (guesses.length <= 5) {
          guessToStore =
            guess === ""
              ? { guess: Notices.NoInputGuess, correct: false }
              : { guess: guess, correct: false };
          setGuesses([...guesses, guessToStore]);
          storeGuess(guessToStore);
          if (guesses.length >= 5) {
            setOutOfGuesses(true);
            setNotice(Notices.OutOfGuesses + pokemonName + ".");
          }
          // if (guess.length === 0) {
          //   setNotice(Notices.NoInputGuess);
          // } else {
          //   setNotice(Notices.Wrong);
          // }
        } else {
          setNotice(Notices.AttemptedGuessAfterFailure);
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

  const storeGuess = (guess: { guess: string; correct: boolean }) => {
    if (isDailyVersion) {
      const guessesToStore = guesses;
      guessesToStore.push(guess);
      const guessToStore: StoredGuess = {
        date: getFormattedDate(new Date()),
        number: pokemonNumber,
        guesses: guessesToStore
      };
      console.log("storing prevGuess in storeGuess", guessToStore);
      localStorage.setItem("pokedle_prevGuess", JSON.stringify(guessToStore));
    }
  };

  useEffect(() => {
    const prevGuesses: StoredGuess | null = JSON.parse(localStorage.getItem("pokedle_prevGuess"));
    if (isDailyVersion && prevGuesses !== null) {
      if (prevGuesses?.date !== getFormattedDate(new Date())) {
        // reset();
      } else {
        setPokemonNumber(prevGuesses.number);
        setGuesses(prevGuesses.guesses);
      }
    } else {
      reset();
    }
  }, [isDailyVersion]);

  if (error) {
    return <div>{error}</div>;
  }
  // if (isLoading) {
  //   return (<div><div id="loader" style={{ display: (isLoading ? "" : "none") }} /></div>)
  // }
  return (
    <div className="App">
      <div className="toolbar">
        <div className="reset-button button" onClick={reset}>
          <span>&#8635;</span>
        </div>
        <h2>POKÉDLE - {isDailyVersion ? `DAILY` : `PRACTICE`}</h2>
        <div
          className="info-button button"
          onMouseEnter={() => setShowInfo(true)}
          onClick={() => setShowInfo(!showInfo)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <span>{showInfo ? `x` : <>&#x2699;</>}</span>
        </div>
        {showInfo && (
          <div className="info popover">
            <div className="daily-toggle">
              <p>Practice mode: </p>
              <input
                type="checkbox"
                checked={!isDailyVersion}
                onChange={() => setIsDailyVersion(!isDailyVersion)}
              />
            </div>
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

      {isLoading ? (
        <div>
          <div id="loader" style={{ display: (isLoading ? "" : "none") }} />
        </div>
      ) : (
        <div className="main-container">
          <p>{redactedDescription}</p>
          {guesses.length >= 1 && (
            <p>
              {height}, {weight}
            </p>
          )}
          {guesses.length >= 2 && <p>Generation: {generation}</p>}
          {guesses.length >= 3 && (
            <p>
              Abilities:{" "}
              {pokemon?.abilities && displayAbilities(pokemon.abilities)}
            </p>
          )}
          {guesses.length >= 4 && (
            <p>
              Colour:{" "}
              {pokemonSpecies?.color &&
                pokemonSpecies.color.name.charAt(0).toUpperCase() +
                pokemonSpecies.color.name.slice(1)}
            </p>
          )}
          {guesses.length >= 5 && <p>Species: {species}</p>}
          {!outOfGuesses && !correctGuess && (
            <div className="input-div">
              {listOfPokemonNames && listOfPokemonNames.length > 2 ? (
                <SearchableDropdown
                  options={listOfPokemonNames}
                  id="guess"
                  selectedGuess={selectedGuess}
                  handleChange={sel => setSelectedGuess(sel)}
                  submitGuess={submitGuess}
                />
              ) : (
                <>
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
                    value={"\u21B5"}
                  ></input>
                </>
              )}
            </div>
          )}

          <div className="guesses-list">
            <span>{displayGuesses()}</span>
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
      )}
    </div>
  );
}

export default App;
