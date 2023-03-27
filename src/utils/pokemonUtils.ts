import { map } from "lodash";
import { PokemonSpecies, Ability } from "../Pokemon";

export interface Guess {
  guess: string;
  correct: boolean;
}

interface FormattedPokemonNames {
  basic: string;
  formatted: string;
}

interface AllPokemonNamesGraphqlResponse {
  data: {
    pokemon_v2_pokemonspeciesname: [{ name: string }]
  }
}

const redacted = "[REDACTED]";
const identifiableTerms = [
  "Ultra Beast",
  "Legendary",
  "Mythical",
  "Fossilized",
  "Fossil",
  "Ancient"
];
const regions = [
  "Kanto",
  "Johto",
  "Hoenn",
  "Sinnoh",
  "Unova",
  "Kalos",
  "Alola",
  "Galar",
  "Hisui",
  "Paldea"
];
const formattedNames: FormattedPokemonNames[] = [
  {
    basic: "nidoran-f",
    formatted: "Nidoran♀"
  },
  {
    basic: "nidoran-m",
    formatted: "Nidoran♂"
  },
  {
    basic: "farfetchd",
    formatted: "Farfetch'D"
  },
  {
    basic: "mr-mime",
    formatted: "Mr. Mime"
  },
  {
    basic: "mime-jr",
    formatted: "Mime Jr."
  },
  {
    basic: "porygon-z",
    formatted: "Porygon-Z"
  },
  {
    basic: "keldeo-ordinary",
    formatted: "Keldeo"
  },
  {
    basic: "type-null",
    formatted: "Type: Null"
  },
  {
    basic: "jangmo-o",
    formatted: "Jangmo-o"
  },
  {
    basic: "hakamo-o",
    formatted: "Hakamo-o"
  },
  {
    basic: "kommo-o",
    formatted: "Kommo-o"
  },
  {
    basic: "sirfetchd",
    formatted: "Sirfetch'D"
  },
  {
    basic: "mr-rime",
    formatted: "Mr. Rime"
  },
  {
    basic: "great-tusk",
    formatted: "Great Tusk"
  },
  {
    basic: "scream-tail",
    formatted: "Scream Tail"
  },
  {
    basic: "brute-bonnet",
    formatted: "Brute Bonnet"
  },
  {
    basic: "flutter-mane",
    formatted: "Flutter Mane"
  },
  {
    basic: "slither-wing",
    formatted: "Slither Wing"
  },
  {
    basic: "sandy-shocks",
    formatted: "Sandy Shocks"
  },
  {
    basic: "iron-treads",
    formatted: "Iron Treads"
  },
  {
    basic: "iron-bundle",
    formatted: "Iron Bundle"
  },
  {
    basic: "iron-hands",
    formatted: "Iron Hands"
  },
  {
    basic: "iron-jugulis",
    formatted: "Iron Jugulis"
  },
  {
    basic: "iron-moth",
    formatted: "Iron Moth"
  },
  {
    basic: "iron-thorns",
    formatted: "Iron Thorns"
  },
  {
    basic: "wo-chien",
    formatted: "Wo-Chien"
  },
  {
    basic: "chien-pao",
    formatted: "Chien-Pao"
  },
  {
    basic: "ting-lu",
    formatted: "Ting-Lu"
  },
  {
    basic: "chi-yu",
    formatted: "Chi-Yu"
  },
  {
    basic: "roaring-moon",
    formatted: "Roaring Moon"
  },
  {
    basic: "iron-valiant",
    formatted: "Iron Valiant"
  },
  {
    basic: "iron-leaves",
    formatted: "Iron Leaves"
  }
];

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

export const capitaliseName = (name: string): string => {
  var capitalisedName = "";
  formattedNames.forEach(formattedName => {
    if (formattedName.basic === name) {
      console.log(
        "setting name to :",
        formattedName.formatted,
        " instead of ",
        name
      );
      capitalisedName = formattedName.formatted;
    }
  });
  if (capitalisedName !== "") {
    return capitalisedName;
  }
  if (!name.includes(" ") && !name.includes("-")) {
    return name.substring(0, 1).toLocaleUpperCase() + name.substring(1);
  }
  var combinedName = "";
  if (name.includes(" ")) {
    var separatedName = name.split(" ");
    if (separatedName.length > 1) {
      separatedName.forEach(nameSection => {
        combinedName =
          combinedName +
          nameSection.substring(0, 1).toLocaleUpperCase() +
          nameSection.substring(1);
      });
    }
  }
  var nameToUse = combinedName !== "" ? combinedName : name;
  if (nameToUse.includes("-")) {
    var separatedDashName = nameToUse.split("-");
    if (separatedDashName.length > 1) {
      separatedDashName.forEach((nameSection, index) => {
        combinedName =
          index === 0
            ? combinedName +
            nameSection.substring(0, 1).toLocaleUpperCase() +
            nameSection.substring(1)
            : combinedName +
            "-" +
            nameSection.substring(0, 1).toLocaleUpperCase() +
            nameSection.substring(1);
      });
    }
  }
  return combinedName;
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
        const nameWithoutForme = capitalisedName
          .toLocaleLowerCase()
          .includes("tapu-")
          ? capitalisedName.split("-").join(" ")
          : capitalisedName.toLocaleLowerCase().includes("o-o") ||
            capitalisedName === "Porygon-Z"
            ? capitalisedName
            : capitalisedName.split("-", 1)[0];
        pokemonArray.push(nameWithoutForme);
      });
      localStorage.setItem(
        "pokedle_pokemonNames",
        JSON.stringify(pokemonArray)
      );
      console.log(
        "stored to localStorage: ",
        localStorage.getItem("pokedle_pokemonNames")
      );
    } else {
      console.log(`error ${request.status} ${request.statusText}`);
    }
  };
  return pokemonArray;
};

const replaceAt = (
  desc: string,
  index: number,
  replacement: string,
  nameLength: number
): string => {
  console.log(desc, index, replacement);
  return (
    desc.substring(0, index) + replacement + desc.substring(index + nameLength)
  );
};

const hideAAndAnGiveaways = (description: string): string => {
  console.log("changing a and an to a(n) in ", description);
  let desc = description;
  let indexOfAnBeforeRedacted = desc.indexOf(" an " + redacted);
  if (indexOfAnBeforeRedacted === -1) {
    indexOfAnBeforeRedacted = desc.indexOf("An " + redacted);
  }
  if (indexOfAnBeforeRedacted !== -1) {
    desc = replaceAt(
      desc,
      indexOfAnBeforeRedacted + 1,
      "(n) " + redacted,
      redacted.length
    );
  }
  let indexOfABeforeRedacted = desc.indexOf(" a " + redacted);
  if (indexOfABeforeRedacted === -1) {
    indexOfABeforeRedacted = desc.indexOf("A " + redacted);
  }
  if (indexOfABeforeRedacted !== -1) {
    console.log("replacing a");
    desc = replaceAt(
      desc,
      indexOfABeforeRedacted + 2,
      "(n) " + redacted,
      redacted.length
    );
  }
  return desc;
};

const indexInDesc = (description: string, name: string): number => {
  return description.indexOf(name);
};

const getDescription = (pokemon: PokemonSpecies): string => {
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

export const trimDescription = (pokemon: PokemonSpecies, allPokemonNames: string[]): string => {
  var name: string = "";
  pokemon.names.some(pokeName => {
    if (pokeName.language.name === "en") {
      name = pokeName.name;
      return true;
    }
    return false;
  });
  let description: string = getDescription(pokemon);
  console.log("checking for ", name, " in ", description);
  const indexOfName = indexInDesc(description, name);
  if (indexOfName !== -1) {
    description = replaceAt(description, indexOfName, redacted, name.length);
  }
  if (allPokemonNames.length > 0) {
    allPokemonNames.forEach(pokemonName => {
      description = description.replaceAll(pokemonName, redacted);
    });
  }
  identifiableTerms.forEach(term => {
    const indexOfTerm = indexInDesc(description, term);
    if (indexOfTerm !== -1) {
      description = replaceAt(description, indexOfTerm, redacted, term.length);
      description = hideAAndAnGiveaways(description);
    }
  });
  regions.forEach(region => {
    description = description.replaceAll(region, redacted);
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
    const storedNames = localStorage?.getItem("pokedle_pokemonNames");
    if (storedNames && storedNames.length > 100) {
      console.log("fetching names from localStorage");
      resolve(JSON.parse(storedNames));
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

        localStorage.setItem(
          "pokedle_pokemonNames",
          JSON.stringify(nameArray)
        );
        console.log(
          "stored to localStorage: ",
          localStorage.getItem("pokedle_pokemonNames")
        );
        resolve(nameArray);
      } else {
        // graphql request for pokemon names failed, so use legacy call and format response
        resolve(fetchAllPokemonNamesBackup());
      }
    }
  });
}
