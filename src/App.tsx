import React, { useState, useEffect } from "react";
import { PokemonNew, PokemonSpecies } from "./Pokemon";
import "./App.scss";
//@ts-ignore
import { getFormattedDate } from "./utils/dateUtils.ts";
import {
  Guess,
  displayAbilities,
  fetchAllPokemonNames,
  getPokemonCount,
  simplifyPokemonName,
  //@ts-ignore
} from "./utils/pokemonUtils.ts";
//@ts-ignore
import { formatHeight, formatWeight, trimDescription } from "./utils/textUtils.ts";
//@ts-ignore
import { fetchPokemon, fetchPokemonSpecies } from "./utils/fetchUtils.ts";
//@ts-ignore
import { updateScore } from "./utils/scoreUtils.ts"
import SearchableDropdown from "./components/SearchableDropdown";

import lottie from "lottie-web";
import lottieAnimation from "./assets/loading-lottie.json";
import StatsModal from "./components/StatsModal";
import { storeScore } from "./utils/storageUtils";

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
  const [correctGuess, setCorrectGuess] = useState(-1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showStats, setShowStats] = useState(false);
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

  var seedrandom = require('seedrandom');

  /**
   * Update loading status when fetching is finished
   */
  useEffect(() => {
    setTimeout(() => {
      if (pokemonFetched && pokemonSpeciesFetched && pokemonListFetched) {
        setIsLoading(false);
      }
    }, 2000);
  }, [pokemonFetched, pokemonSpeciesFetched, pokemonListFetched]);

  /**
   * Set up Pokémon searchable dropdown list
   */
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
        }, 1000);
      });
    }
  }, [listOfPokemonNames])

  /**
   * Set up loading animation
   */
  useEffect(() => {
    const element = document.getElementById("loader");
    if (element && isLoading) {
      lottie.loadAnimation({
        container: element, // the dom element that will contain the animation
        renderer: 'svg',
        animationData: lottieAnimation // the path to the animation json
      });
    }
  }, [isLoading]);

  /**
   * Generate new Pokémon & fetch all details
   */
  useEffect(() => {
    if (!pokemonListFetched || listOfPokemonNames.length < 100) {
      console.log("waiting for pokemon list to be fetched...");
    } else {
      const pokemonCount = getPokemonCount();
      if (pokemonNumber === 0) {
        if (isDailyVersion) {
          const rngBasedOnDate = seedrandom(new Date().toDateString());

          const nowDate: Date = new Date();
          nowDate.setHours(0, 0, 0, 0);
          const prevGuess: StoredGuess | null = JSON.parse(
            localStorage.getItem("pokedle_todaysGuess")
          );
          const prevGuessTime: string | null = prevGuess && prevGuess.date;
          if (prevGuessTime !== null) {
            const prevDate = new Date(prevGuessTime);
            prevDate.setHours(0, 0, 0, 0);
            if (prevGuess && nowDate.valueOf() === prevDate.valueOf()) {
              setPokemonNumber(prevGuess.number);
            } else {
              setNewPokemonNumber(rngBasedOnDate, pokemonCount);
            }
          } else {
            setNewPokemonNumber(rngBasedOnDate, pokemonCount);
          }
        } else {
          /** Set up for practice mode - but DON'T generate the same as today's daily pokemon */
          let pokemonNum: number = 0;
          const prevGuess: StoredGuess | null = JSON.parse(
            localStorage.getItem("pokedle_todaysGuess")
          );
          const dailyNum: number = prevGuess === null ? 0 : prevGuess.number;
          do {
            pokemonNum = generatePokemonNumber(Math.random, pokemonCount);
            console.log(pokemonNum, dailyNum, pokemonNum === dailyNum);
          } while (
            pokemonNum === 0 || pokemonNum === dailyNum
          )
          setPokemonNumber(pokemonNum);
        }
      }
    }
    if (!pokemonFetched && pokemonNumber !== 0) {
      fetchPokemon(pokemonNumber, setError).then(data => setPokemon(data));
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
      setHeight(formatHeight(pokemon.height));
      setWeight(formatWeight(pokemon.weight));
      console.log("Hello", pokemon, pokemonSpecies);
    }

    function setNewPokemonNumber(rngBasedOnDate: any, pokemonCount: any) {
      const newPokemon = generatePokemonNumber(rngBasedOnDate, pokemonCount);
      setPokemonNumber(newPokemon);
      localStorage.setItem("pokedle_todaysGuess", JSON.stringify({ number: newPokemon, date: getFormattedDate(new Date()), guesses: [] }));
    }

    function generatePokemonNumber(rngBasedOnDate: any, pokemonCount: any) {
      return Math.floor(rngBasedOnDate() * (pokemonCount - 1)) + 1;
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon, pokemonSpecies, pokemonNumber, listOfPokemonNames, pokemonListFetched, isDailyVersion]);

  const reset = () => {
    setIsLoading(true);
    setPokemon(undefined);
    setPokemonName("")
    setRedactedDescription("");
    setPokemonSpecies(undefined);
    setPokemonNumber(0);
    setCorrectGuess(-1);
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
    const guess = input?.value || "";
    input.value = "";
    console.log("user made the guess: ", guess, "for pokémon", pokemonName);
    console.log("correctGuess: ", correctGuess, correctGuess > -1);
    if (correctGuess <= -1) {
      let guessToStore: { guess: string; correct: boolean };
      if (
        simplifyPokemonName(guess).toLocaleLowerCase() ===
        (simplifyPokemonName(pokemonName).toLocaleLowerCase() ||
          simplifyPokemonName(pokemon?.name).toLocaleLowerCase())
      ) {
        guessToStore = { guess: pokemonName, correct: true };
        setGuesses(prevGuesses => [...prevGuesses, guessToStore]);
        console.log("setting correct guess to ", guesses.length + 1);
        setCorrectGuess(guesses.length + 1);
        storeScore(updateScore(guesses.length + 1));
        storeGuess(guessToStore);
        setNotice(Notices.Right + guesses.length + "!");
        setTimeout(() => {
          setShowStats(true);
        }, 2000);
      } else {
        if (guesses.length <= 5) {
          guessToStore =
            guess === ""
              ? { guess: Notices.NoInputGuess, correct: false }
              : { guess: guess, correct: false };
          setGuesses([...guesses, guessToStore]);
          storeGuess(guessToStore);
          if (guesses.length >= 5) {
            updateScore(7);
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
    console.log("Have made a guess", correctGuess, guesses.length);
    setTimeout(() => {
      setNotice("");
    }, 5000);
  };

  const displayGuesses = () => {
    const guessList = guesses.map((guess: Guess, index: number) => {
      return (
        <tr style={{ padding: "8px" }} className="guess" key={index}>
          <td style={{ padding: "4px" }}>{guess.guess}</td>
          <td style={{ padding: "4px" }}>{guess.correct ? "\u2714" : "\u2718"}</td>
        </tr>
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
      localStorage.setItem("pokedle_todaysGuess", JSON.stringify(guessToStore));
    }
  };

  useEffect(() => {
    const prevGuesses: StoredGuess | null = JSON.parse(localStorage.getItem("pokedle_todaysGuess"));
    if (isDailyVersion && prevGuesses !== null) {
      if (prevGuesses?.date !== getFormattedDate(new Date())) {
        reset();
      } else {
        setPokemonNumber(prevGuesses.number);
        setGuesses(prevGuesses.guesses);
        setCorrectGuess(-1);
        setPokemonFetched(false);
        setPokemonSpeciesFetched(false);
        setRedactedDescription("");
        setIsLoading(true);
        prevGuesses.guesses.forEach((guess, index) => {
          if (guess.correct === true) {
            setCorrectGuess(index + 1);
          }
        })
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
    <div className="App" id="app">
      <div className="toolbar">
        <div
          className="stats-button button"
          onMouseEnter={() => setShowStats(true)}
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? `x` : <>&#9745;</>}
        </div>
        <h2 className="title">POKÉDLE - {" "}
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setIsDailyVersion(!isDailyVersion)}>{isDailyVersion ? `DAILY` : `PRACTICE`}</span></h2>
        <div
          className="info-button button"
          onMouseEnter={() => setShowInfo(true)}
          onClick={() => setShowInfo(!showInfo)}
        >
          <span>{showInfo ? `x` : <>&#x2699;</>}</span>
        </div>
        {showInfo && (
          <div className="info popover"
            onMouseLeave={() => setShowInfo(false)}>
            <p>Generations 1-8 supported (Dex numbers 0001-0905)</p>
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
        {showStats && (
          <div className="stats popover"
            onMouseLeave={() => setShowStats(false)}>
            <StatsModal />
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
          {guesses.length >= 1 && (correctGuess === -1 || correctGuess > 1) && (
            <p>
              Height: {height} - Weight: {weight}
            </p>
          )}
          {guesses.length >= 2 && (correctGuess === -1 || correctGuess > 2) && <p>Generation: {generation}</p>}
          {guesses.length >= 3 && (correctGuess === -1 || correctGuess > 3) && (
            <p>
              Abilities:{" "}
              {pokemon?.abilities && displayAbilities(pokemon.abilities)}
            </p>
          )}
          {guesses.length >= 4 && (correctGuess === -1 || correctGuess > 4) && (
            <p>
              Colour:{" "}
              {pokemonSpecies?.color &&
                pokemonSpecies.color.name.charAt(0).toUpperCase() +
                pokemonSpecies.color.name.slice(1)}
            </p>
          )}
          {guesses.length >= 5 && (correctGuess === -1 || correctGuess > 5) && <p>Species: {species}</p>}
          <div className="input-div">
            {!outOfGuesses && correctGuess < 0 && (
              <>
                {listOfPokemonNames && listOfPokemonNames.length > 2 ? (
                  <>
                    <SearchableDropdown
                      options={listOfPokemonNames}
                      id="guess"
                      selectedGuess={selectedGuess}
                      handleChange={sel => setSelectedGuess(sel)}
                      submitGuess={submitGuess}
                    />
                    {/* {!isDailyVersion && <input className="input-button" onClick={reset} type="button" value={"\u21BB"} />} */}
                  </>
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
              </>
            )}
            {!isDailyVersion && <input className="input-button" onClick={reset} type="button" value={"\u21BB"} />}
          </div>

          <table className="guesses-list">
            <thead><tr><th>Guesses</th><th>{"\u2714"} / {"\u2718"}</th></tr></thead>
            <tbody>{displayGuesses()}</tbody>
          </table>
          {notice !== "" && (
            <div className="popover">
              <p>{notice}</p>
            </div>
          )}
          {(outOfGuesses || correctGuess > -1) && (
            <img className="sprite" src={sprite || ""} alt={pokemonName} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
