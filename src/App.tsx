import React, { useState, useEffect } from "react";
import { PokemonNew, PokemonSpecies } from "./context/Pokemon";
import "./App.scss";
import { getFormattedDate } from "./utils/dateUtils";
import { Guess, formatGuesses } from "./utils/guessUtils";
import {
  displayAbilities,
  fetchAllPokemonNames,
  getDescription,
  getPokemonCount,
  simplifyPokemonName,
} from "./utils/pokemonUtils";
import { formatHeight, formatWeight, trimDescription } from "./utils/textUtils";
import { fetchPokemon, fetchPokemonSpecies } from "./utils/fetchUtils";
import { updateScore } from "./utils/scoreUtils"
import SearchableDropdown from "./components/SearchableDropdown";

import lottie from "lottie-web";
import lottieAnimation from "./assets/loading-lottie.json";
import StatsModal, { maxDistributionScore } from "./components/StatsModal";
import { fetchGuessFromLocalStorage, fetchScoreFromLocalStorage, fetchThemeFromLocalStorage, storeGuess, storeScore } from "./utils/storageUtils";
import { InfoPopover } from "./components/InfoPopover";
import { getNewTheme } from "./utils/themeUtils";
import { ThemeProvider } from "styled-components";
import { Button, Input, InputButton, PopoverContainer, PopoverContent, Toolbar } from "./styles";
import { BsGearFill, BsFillXSquareFill, BsArrowClockwise, BsCheckLg, BsBarChartLineFill } from "react-icons/bs";

const enum Notices {
  Right = "SUCCESS!! You got it in ",
  Wrong = "Incorrect :')",
  AttemptedGuessAfterSuccess = "You've already got it dude, take the win.",
  NoInputGuess = "Skipped",
  OutOfGuesses = "Aww, better luck next time! The correct answer was ",
  AttemptedGuessAfterFailure = "Sorry, you're out of guesses. Try out practice mode, or come back tomorrow!",
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
  const [theme, setTheme] = useState(fetchThemeFromLocalStorage());

  var seedrandom = require('seedrandom');

  /**
   * Update loading status when fetching is finished
   */
  useEffect(() => {
    setTimeout(() => {
      if (pokemonFetched && pokemonSpeciesFetched && pokemonListFetched) {
        setIsLoading(false);
      }
    }, 1000);
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
        const prevGuess = fetchGuessFromLocalStorage();
        if (isDailyVersion) {
          const rngBasedOnDate = seedrandom(new Date().toDateString());
          const nowDate: Date = new Date();
          nowDate.setHours(0, 0, 0, 0);
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
        const descriptionToShow = correctGuess !== -1 || outOfGuesses ?
          getDescription(pokemonSpecies) :
          trimDescription(pokemonSpecies, listOfPokemonNames);
        setRedactedDescription(descriptionToShow);
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
      storeGuess(formatGuesses([], newPokemon));
    }

    function generatePokemonNumber(rngBasedOnDate: any, pokemonCount: any) {
      return Math.floor(rngBasedOnDate() * (pokemonCount - 1)) + 1;
    }
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

  const animateShowStats = () => {
    const score = fetchScoreFromLocalStorage();

    const bars = Array.from(document.getElementsByClassName('distribution-bar'));
    const maxScore = maxDistributionScore([score["1"], score["2"], score["3"], score["4"], score["5"], score["6"]]);

    bars.forEach((bar, index) => {
      const distributionBasedWidth = (score[(index + 1).toString()] / maxScore) * 100;
      setTimeout(() => { bar.setAttribute('style', `width: calc(${distributionBasedWidth}% - 2%);`) }, 150 * (index));
    });
  }

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
          (pokemon?.name && simplifyPokemonName(pokemon.name).toLocaleLowerCase()))
      ) {
        guessToStore = { guess: pokemonName, correct: true };
        setGuesses(prevGuesses => [...prevGuesses, guessToStore]);
        console.log("setting correct guess to ", guesses.length + 1);
        setCorrectGuess(guesses.length + 1);
        setNotice(Notices.Right + (guesses.length + 1) + "!");
        pokemonSpecies && setRedactedDescription(getDescription(pokemonSpecies));
        storeGuess(formatGuesses(guesses, pokemonNumber, guessToStore));
        if (isDailyVersion) {
          storeScore(updateScore(guesses.length));
          setTimeout(() => {
            setShowStats(true);
          }, 2000);
        }
      } else {
        if (guesses.length <= 5) {
          guessToStore =
            guess === ""
              ? { guess: Notices.NoInputGuess, correct: false }
              : { guess: guess, correct: false };
          setGuesses([...guesses, guessToStore]);
          storeGuess(formatGuesses(guesses, pokemonNumber, guessToStore));
          if (guesses.length >= 6) {
            setOutOfGuesses(true);
            setNotice(Notices.OutOfGuesses + pokemonName + ".");
            pokemonSpecies && setRedactedDescription(getDescription(pokemonSpecies));
            if (isDailyVersion) {
              storeScore(updateScore(7));
              setTimeout(() => {
                setShowStats(true);
              }, 2000);
            }
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

  useEffect(() => {
    const prevGuess = fetchGuessFromLocalStorage();
    if (isDailyVersion && prevGuess !== null) {
      if (prevGuess?.date !== getFormattedDate(new Date())) {
        reset();
      } else {
        setPokemonNumber(prevGuess.number);
        setGuesses(prevGuess.guesses);
        setCorrectGuess(-1);
        setPokemonFetched(false);
        setPokemonSpeciesFetched(false);
        setRedactedDescription("");
        setIsLoading(true);
        prevGuess.guesses.forEach((guess, index) => {
          if (guess.correct === true) {
            setCorrectGuess(index + 1);
          }
        })
      }
    } else {
      reset();
    }
  }, [isDailyVersion]);

  useEffect(() => {
    if (showStats) {
      setTimeout(() => { animateShowStats() }, 1);
    }
  }, [showStats])

  if (error) {
    return <div>{error}</div>;
  }
  // if (isLoading) {
  //   return (<div><div id="loader" style={{ display: (isLoading ? "" : "none") }} /></div>)
  // }
  return (
    <ThemeProvider theme={theme}>
      <div className="App" id="app">
        <Toolbar className="toolbar">
          <Button
            className="stats-button button"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? <BsFillXSquareFill color={theme.secondary} /> : <BsBarChartLineFill color={theme.secondary} />}
          </Button>
          <h2 className="title">POKÉDLE - {" "}
            <span className="link" onClick={() => setIsDailyVersion(!isDailyVersion)}>{isDailyVersion ? `DAILY` : `PRACTICE`}</span></h2>
          <Button
            className="info-button button"
            onClick={() => setShowInfo(!showInfo)}
          >
            {showInfo ? <BsFillXSquareFill color={theme.secondary} /> : <BsGearFill color={theme.secondary} />}
          </Button>
          {showInfo && (
            <InfoPopover updateTheme={() => setTheme(getNewTheme(theme))} />
          )}
          {showStats && (
            <PopoverContainer className="stats popover-container">
              <PopoverContent className="popover-content">
                <StatsModal />
              </PopoverContent>
            </PopoverContainer>
          )}
        </Toolbar>

        {isLoading ? (
          <div>
            <div id="loader" />
          </div>
        ) : (
          <div className="main-container">
            <p className="description">{redactedDescription}</p>
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
                        theme={theme}
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        type="text"
                        id="guess"
                        name="guess"
                        onKeyDown={e => e.key === "Enter" && submitGuess()}
                        autoComplete="off"
                      ></Input>
                      <InputButton
                        className="input-button"
                        type="submit"
                        onClick={submitGuess}
                        disabled={outOfGuesses}
                      >
                        <BsCheckLg color={theme.secondary} />
                      </InputButton>
                    </>
                  )}
                </>
              )}
              {!isDailyVersion && <Button className="input-button" onClick={reset}><BsArrowClockwise color={theme.secondary} /></Button>}
            </div>

            <table className="guesses-list">
              <thead><tr><th>Guesses</th><th>{"\u2714"} / {"\u2718"}</th></tr></thead>
              <tbody>{displayGuesses()}</tbody>
            </table>
            {notice !== "" && (
              <PopoverContainer className="popover-container">
                <PopoverContent className="popover-content">
                  <p>{notice}</p>
                </PopoverContent>
              </PopoverContainer>
            )}
            {(outOfGuesses || correctGuess > -1) && (
              <img className="sprite" src={sprite || ""} alt={pokemonName} />
            )}
          </div>
        )}
      </div>
    </ThemeProvider >
  );
}

export default App;
