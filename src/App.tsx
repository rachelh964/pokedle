import React, { useState, useEffect } from "react";
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

const enum Notices {
  Right = "SUCCESS!! You got it in ",
  Wrong = "Incorrect :')",
  AttemptedGuessAfterSuccess = "You've already got it dude, take the win.",
  NoInputGuess = "Skipped",
  OutOfGuesses = "Aww, better luck next time! The correct answer was "
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
  const [guessNum, setGuessNum] = useState(1);
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
  const [selectedGuess, setSelectedGuess] = useState("");
  const [listOfPokemonNames, setListOfPokemonNames] = useState([]);

  useEffect(() => {
    setListOfPokemonNames(
      fetchAllPokemonNames()
        .toString()
        .replace(/[\[\]"]+/g, "")
        .split(",")
    );
  }, []);

  useEffect(() => {
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
          if (nowDate.valueOf() === prevDate.valueOf()) {
            setPokemonNumber(prevGuess.number);
          } else {
            setPokemonNumber(Math.floor(Math.random() * (905 - 1)) + 1);
          }
        } else {
          setPokemonNumber(Math.floor(Math.random() * (905 - 1)) + 1);
        }
      } else {
        setPokemonNumber(Math.floor(Math.random() * (905 - 1)) + 1);
        // setPokemonNumber(128);
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
      if (redactedDescription === "") {
        setRedactedDescription(trimDescription(pokemonSpecies));
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
  }, [pokemon, pokemonSpecies, pokemonNumber]);

  const reset = () => {
    setPokemon(undefined);
    setRedactedDescription("");
    setPokemonSpecies(undefined);
    setPokemonNumber(0);
    setGuessNum(1);
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
    console.log(
      simplifyPokemonName(guess).toLocaleLowerCase(),
      simplifyPokemonName(pokemon?.name).toLocaleLowerCase(),
      simplifyPokemonName(pokemonName).toLocaleLowerCase()
    );
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
        setNotice(Notices.Right + guessNum + "!");
      } else {
        guessToStore =
          guess === ""
            ? { guess: Notices.NoInputGuess, correct: false }
            : { guess: guess, correct: false };
        setGuesses(prevGuesses => [...prevGuesses, guessToStore]);
        storeGuess(guessToStore);
        if (guessNum >= 6) {
          setOutOfGuesses(true);
          setNotice(Notices.OutOfGuesses + pokemonName + ".");
        } else {
          setGuessNum(guessNum + 1);
          // if (guess.length === 0) {
          //   // setNotice(Notices.NoInputGuess);
          // } else {
          //   // setNotice(Notices.Wrong);
          // }
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
    console.log(guesses);
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
    const guessesToStore = guesses;
    guessesToStore.push(guess);
    const guessToStore: StoredGuess = {
      date: getFormattedDate(new Date()),
      number: pokemonNumber,
      guesses: guessesToStore
    };
    localStorage.setItem("pokedle_prevGuess", JSON.stringify(guessToStore));
  };

  useEffect(() => {
    if (isDailyVersion) {
      const prevGuesses = JSON.parse(localStorage.getItem("pokedle_prevGuess"));
      if (prevGuesses?.date !== getFormattedDate(new Date())) {
        // reset();
      } else {
        setPokemonNumber(prevGuesses?.number);
        setGuesses(prevGuesses.guesses);
        setGuessNum(prevGuesses.guesses.length);
      }
    } else {
      reset();
    }
  }, [isDailyVersion]);

  if (error) {
    return <div>{error}</div>;
  } else {
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

        <div className="main-container">
          <p>{redactedDescription}</p>
          {guessNum >= 2 && (
            <p>
              {height}, {weight}
            </p>
          )}
          {guessNum >= 3 && <p>Generation: {generation}</p>}
          {guessNum >= 4 && (
            <p>
              Abilities:{" "}
              {pokemon?.abilities && displayAbilities(pokemon.abilities)}
            </p>
          )}
          {guessNum >= 5 && (
            <p>
              Colour:{" "}
              {pokemonSpecies.color.name.charAt(0).toUpperCase() +
                pokemonSpecies.color.name.slice(1)}
            </p>
          )}
          {guessNum >= 6 && <p>Species: {species}</p>}
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
      </div>
    );
  }
}

export default App;
