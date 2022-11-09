import { PokemonNew, PokemonSpecies } from "../Pokemon";
import { camelCase, transform, isArray, isObject } from "lodash";

const enum Errors {
  FailedToFetch = "Failed to fetch a pokemon. Check your WiFi?"
}

const fetchPokemon = async (
  pokemonNumber: number,
  isSpecies: boolean
): Promise<JSON> => {
  const link =
    "https://pokeapi.co/api/v2/pokemon" +
    (isSpecies ? "-species" : "") +
    "/" +
    pokemonNumber;
  const promise = await fetch(link);
  const data = await promise.json();
  return data;
};

export const fetchPokemonNew = async (
  pokemonNumber: number,
  setError: (error: string) => void
): Promise<PokemonNew | undefined> => {
  const pokemonResponse = await fetchPokemon(pokemonNumber, false);
  if (pokemonResponse !== undefined) {
    const pokemonCamelResponse: PokemonNew = camelize(
      pokemonResponse
    ) as PokemonNew;
    console.log("pokemon data: ", pokemonCamelResponse);
    return pokemonCamelResponse;
  } else {
    setError(Errors.FailedToFetch);
  }
  return undefined;
};

export const fetchPokemonSpecies = async (
  pokemonNumber: number,
  setError: (error: string) => void
): Promise<PokemonSpecies | undefined> => {
  const pokemonResponse = await fetchPokemon(pokemonNumber, true);
  if (pokemonResponse !== undefined) {
    const pokemonSpeciesCamelResponse: PokemonSpecies = camelize(
      pokemonResponse
    ) as PokemonSpecies;
    console.log("pokemon data: ", pokemonSpeciesCamelResponse);
    return pokemonSpeciesCamelResponse;
  } else {
    setError(Errors.FailedToFetch);
  }
  return undefined;
};

/** API returns in snake_case, converting to camelCase */
const camelize = (obj: any) =>
  transform(obj, (acc, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);
    acc[camelKey] = isObject(value) ? camelize(value) : value;
  });
