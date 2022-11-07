import { Pokemon } from "./Pokemon";

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
  }
];

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
    return name.substr(0, 1).toLocaleUpperCase() + name.substr(1);
  }
  var combinedName = "";
  if (name.includes(" ")) {
    var separatedName = name.split(" ");
    if (separatedName.length > 1) {
      separatedName.forEach(nameSection => {
        combinedName =
          combinedName +
          nameSection.substr(0, 1).toLocaleUpperCase() +
          nameSection.substr(1);
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
              nameSection.substr(0, 1).toLocaleUpperCase() +
              nameSection.substr(1)
            : combinedName +
              "-" +
              nameSection.substr(0, 1).toLocaleUpperCase() +
              nameSection.substr(1);
      });
    }
  }
  return combinedName;
};

const fetchAllPokemonNames = (): string[] => {
  if (localStorage.getItem("pokemonNames")?.length > 100) {
    console.log("fetching names from localStorage");
    return JSON.parse(localStorage.getItem("pokemonNames"));
  }
  console.log("not in localStorage, fetching pokemon names");
  const pokemonArray: string[] = [];
  const link = "https://pokeapi.co/api/v2/pokemon/?limit=807";
  let request = new XMLHttpRequest();
  request.open("GET", link);
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      const pokemonResponse = JSON.parse(request.response);
      pokemonResponse.results.forEach(pokemon => {
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
      localStorage.setItem("pokemonNames", JSON.stringify(pokemonArray));
      console.log(
        "stored to localStorage: ",
        localStorage.getItem("pokemonNames")
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

export const trimDescription = (pokemon: Pokemon): string => {
  const name = simplifyPokemonName(pokemon.name);
  let description = pokemon.description;
  console.log("checking for ", name, " in ", pokemon.description);
  const indexOfName = indexInDesc(description, name);
  if (indexOfName !== -1) {
    description = replaceAt(description, indexOfName, redacted, name.length);
  }
  const allPokemonNames = fetchAllPokemonNames();
  allPokemonNames.forEach(pokemonName => {
    const indexOfPokemonName = indexInDesc(description, pokemonName);
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
    .includes("o-o")
    ? simplifiedGenderedName
    : simplifiedGenderedName.split("-", 1)[0];
  return nameWithoutForme.replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, "");
};

export const displayAbilities = (abilities: string[]): string => {
  if (abilities.length === 0) {
    return "None";
  }
  return abilities
    .map((ability: string, index: number) => {
      if (index === abilities.length - 1) {
        return ability;
      } else {
        return ability + ", ";
      }
    })
    .join("");
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
