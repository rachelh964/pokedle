import { PokemonNew, PokemonSpecies } from "../context/Pokemon";
import { camelCase, transform, isArray, isObject } from "lodash";
import { dummyPokemon, dummyPokemonSpecies } from "./dummyPokemonResponses";

const enum Errors {
  FailedToFetch = "Failed to fetch a pokemon. Check your WiFi?"
}

const fetchPokemonDetails = async (
  pokemonNumber: number,
  isSpecies: boolean
): Promise<JSON> => {
  const link =
    "https://pokeapi.co/api/v2/pokemon" +
    (isSpecies ? "-species" : "") +
    "/" +
    pokemonNumber;
  try {
    const promise = await fetch(link);
    return await promise.json();
  } catch (e) {
    let dummyData = isSpecies ? dummyPokemonSpecies : dummyPokemon;
    return JSON.parse(JSON.stringify(dummyData));
  }
};

export const fetchPokemon = async (
  pokemonNumber: number,
  setError: (error: string) => void
): Promise<PokemonNew | undefined> => {
  const pokemonResponse = await fetchPokemonDetails(pokemonNumber, false);
  if (pokemonResponse !== undefined) {
    const pokemonCamelResponse: PokemonNew = camelize(
      pokemonResponse
    ) as PokemonNew;
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
  const pokemonResponse = await fetchPokemonDetails(pokemonNumber, true);
  if (pokemonResponse !== undefined) {
    const pokemonSpeciesCamelResponse: PokemonSpecies = camelize(
      pokemonResponse
    ) as PokemonSpecies;
    return pokemonSpeciesCamelResponse;
  } else {
    setError(Errors.FailedToFetch);
  }
  return undefined;
};

/** API returns in snake_case, converting to camelCase */
const camelize = (obj: any) =>
  transform(obj, (acc: Object, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(String(key));
    (acc as any)[camelKey] = isObject(value) ? camelize(value) : value;
  });
