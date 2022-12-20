import { PokemonSpecies, Ability } from "../Pokemon";

export interface Guess {
  guess: string;
  correct: boolean;
}

interface FormattedPokemonNames {
  basic: string;
  formatted: string;
}

const redacted = "[REDACTED]";
const identifiableTerms = [
  "ultra beast",
  "legendary",
  "mythical",
  "fossilized",
  "fossil"
];
const regions = [
  "kanto",
  "johto",
  "hoenn",
  "sinnoh",
  "unova",
  "kalos",
  "alola",
  "galar",
  "hisui"
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
  }
];

export const capitaliseName = (name: string): string => {
  var capitalisedName = "";
  formattedNames.forEach(formattedName => {
    if (
      simplifyPokemonName(formattedName.basic) === simplifyPokemonName(name)
    ) {
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

const fetchAllPokemonNames = (): string[] => {
  const storedNames = localStorage?.getItem("pokedle_pokemonNames");
  if (storedNames && storedNames.length > 100) {
    console.log("fetching names from localStorage");
    return JSON.parse(storedNames);
  }
  console.log("not in localStorage, fetching pokemon names");
  const pokemonArray: string[] = [];
  const link = "https://pokeapi.co/api/v2/pokemon/?limit=905";
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
      localStorage.setItem("pokedle_pokemonNames", JSON.stringify(pokemonArray));
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
  let desc = description;
  const indexOfAnBeforeRedacted = desc.indexOf("an " + redacted);
  const indexOfAnCapBeforeRedacted = desc.indexOf("An " + redacted);
  if (indexOfAnBeforeRedacted !== -1 || indexOfAnCapBeforeRedacted !== -1) {
    desc = replaceAt(
      desc,
      indexOfAnCapBeforeRedacted + 1,
      "(n) " + redacted,
      12
    );
  }
  const indexOfABeforeRedacted = desc.indexOf("a " + redacted);
  const indexOfACapBeforeRedacted = desc.indexOf("A " + redacted);
  if (indexOfABeforeRedacted !== -1 || indexOfACapBeforeRedacted !== -1) {
    desc = replaceAt(
      desc,
      indexOfACapBeforeRedacted + 1,
      "(n) " + redacted,
      12
    );
  }
  return desc;
};

const indexInDesc = (description: string, name: string): number => {
  return description.toLocaleLowerCase().indexOf(name.toLocaleLowerCase());
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

export const trimDescription = (pokemon: PokemonSpecies): string => {
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
  const allPokemonNames = fetchAllPokemonNames();
  allPokemonNames.forEach(pokemonName => {
    const indexOfPokemonName = indexInDesc(description, pokemonName + " ");
    if (indexOfPokemonName !== -1) {
      description = replaceAt(
        description,
        indexOfPokemonName,
        redacted,
        pokemonName.length
      );
    }
  });
  identifiableTerms.forEach(term => {
    const indexOfTerm = indexInDesc(description, term);
    if (indexOfTerm !== -1) {
      description = replaceAt(description, indexOfTerm, redacted, term.length);
      description = hideAAndAnGiveaways(description);
    }
  });
  regions.forEach(region => {
    const indexOfRegion = indexInDesc(description, region);
    if (indexOfRegion !== -1) {
      description = replaceAt(
        description,
        indexOfRegion,
        redacted,
        region.length
      );
    }
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
  abilities: Ability[],
  hiddenAbilities?: boolean
): string => {
  if (abilities.length === 0) {
    return "None";
  }
  return abilities
    .map((ability: Ability) => {
      if (
        hiddenAbilities === undefined ||
        (hiddenAbilities && ability.isHidden) ||
        (!hiddenAbilities && !ability.isHidden)
      ) {
        return capitaliseName(ability.ability.name) + ", ";
      }
      return "";
    })
    .join("")
    .slice(0, -2);
};

export const formatGuess = (guess: string): string => {
  const allPokemonNames = fetchAllPokemonNames();
  allPokemonNames.forEach(name => {
    if (name.toLocaleLowerCase() === guess.toLocaleLowerCase()) {
      return name;
    }
  });
  return guess;
};
