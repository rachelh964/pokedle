import { map } from "lodash";
import { PokemonSpecies, Ability } from "../context/Pokemon";
import { fetchPokemonNamesFromStorage, storePokemonNames } from "./storageUtils";
import { capitaliseName } from "./textUtils";

export interface Guess {
  guess: string;
  correct: boolean;
}

interface AllPokemonNamesGraphqlResponse {
  data: {
    pokemon_v2_pokemonspeciesname: [{ name: string }]
  }
}

export const getPokemonCount = (): number => {
  /** pokeapi doesn't have descriptions for gen 9 just yet, from 906
   * so will set the total count at 905
   */
  // setTimeout(() => {
  //   let pokemonNamesCount: number;
  //   fetchAllPokemonNames().then((allPokemonNames: string[]) => {
  //     pokemonNamesCount = allPokemonNames.length;
  //     console.log(pokemonNamesCount, allPokemonNames, allPokemonNames.length);
  //   });
  //   return pokemonNamesCount;
  // }, 2000);
  return 905;
};

export const fetchAllPokemonNamesBackup = (): string[] => {
  const pokemonArray: string[] = [];
  const link = "https://pokeapi.co/api/v2/pokemon/?limit=" + getPokemonCount();
  let request = new XMLHttpRequest();
  request.open("GET", link);
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      const pokemonResponse = JSON.parse(request.response);
      pokemonResponse.results.forEach((pokemon: any) => {
        const capitalisedName = capitaliseName(pokemon.name);
        pokemonArray.push(capitalisedName);
      });
      storePokemonNames(pokemonArray);
    } else {
      console.log(`error ${request.status} ${request.statusText}`);
    }
  };
  return pokemonArray;
};

export const getDescription = (pokemon: PokemonSpecies): string => {
  const descriptions = pokemon.flavorTextEntries.reverse();
  let description = "";
  descriptions.some(flavorText => {
    if (flavorText.language.name === "en") {
      description = flavorText.flavorText;
      return true;
    }
    return false;
  });
  return description;
};

export const simplifyPokemonName = (name: string): string => {
  // ♂♀
  var simplifiedGenderedName = name
    .replace("\u2642", "M")
    .replace("\u2640", "F");

  var nameWithoutForme = simplifiedGenderedName
    .toLocaleLowerCase()
    .includes("tapu-")
    ? simplifiedGenderedName.split("-").join(" ")
    : simplifiedGenderedName.includes("o-o") ||
      simplifiedGenderedName === "Porygon-Z" ||
      simplifiedGenderedName.toLocaleLowerCase().includes("mr-")
      ? simplifiedGenderedName
      : simplifiedGenderedName.split("-", 1)[0];
  return nameWithoutForme.replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, "");
};

export const displayAbilities = (
  abilities: Ability[]
): string => {
  if (abilities.length === 0) {
    return "None";
  }
  const formattedAbilities = abilities
    .map((ability: Ability) => {
      const formattedAbility = ability.ability.name.split("-");
      var capitalisedAbility: string = "";
      formattedAbility.forEach(nameSection => {
        capitalisedAbility =
          ((capitalisedAbility + " ").length > 1 ? (capitalisedAbility + " ") : "") +
          nameSection.substring(0, 1).toLocaleUpperCase() +
          nameSection.substring(1, nameSection.length);
      });
      return capitalisedAbility;
    });
  return formattedAbilities
    .join(", ") + ", "
      .slice(0, -2);
};

export const formatGuess = (guess: string): string => {
  fetchAllPokemonNames().then((allPokemonNames) => {
    allPokemonNames.forEach(name => {
      if (name.toLocaleLowerCase() === guess.toLocaleLowerCase()) {
        return name;
      }
    });
  });
  return guess;
};

// graphql query for all pokemon names
export const fetchAllPokemonNames = (): Promise<string[]> => {
  return new Promise(function (resolve, reject) {
    const storedNames = fetchPokemonNamesFromStorage();
    if (storedNames && storedNames.length > 100) {
      resolve(storedNames);
    }
    console.log("not in localStorage, fetching pokemon names");
    const data = JSON.stringify({
      query: `{
      pokemon_v2_pokemonspeciesname(where: {pokemon_v2_language: {name: {_eq: "en"}}}) {
        name
      }
    }`
    });

    let request = new XMLHttpRequest();
    request.open("POST", "https://beta.pokeapi.co/graphql/v1beta");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("X-Method-Used", "graphiql");
    request.send(data);
    request.onload = () => {
      if (request.status === 200) {
        const response: AllPokemonNamesGraphqlResponse = JSON.parse(request.response);
        const nameArray = map(response.data.pokemon_v2_pokemonspeciesname, ((element: any) => { return element.name }));
        storePokemonNames(nameArray);
        resolve(nameArray);
      } else {
        // graphql request for pokemon names failed, so use legacy call and format response
        resolve(fetchAllPokemonNamesBackup());
      }
    }
  });
}
