import { PokemonSpecies } from "../context/Pokemon";
import { formattedNames, identifiableTerms, locations, regions } from "../context/Terminology";
import { getDescription } from "./pokemonUtils";

interface Redactor {
  main: string;
  escaped: string;
}

interface Redactors {
  [key: string]: Redactor;
}

const redactors: Redactors = {
  defaultRedactor: {
    main: "[REDACTED]",
    escaped: "\\[REDACTED\\]"
  },
  pokemonRedactor: {
    main: "[POKÉMON]",
    escaped: "\\[POKÉMON\\]"
  },
  regionRedactor: {
    main: "[REGION]",
    escaped: "\\[REGION\\]"
  },
  locationRedactor: {
    main: "[LOCATION]",
    escaped: "\\[LOCATION\\]"
  }
}

/** Description formatting */
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

const replaceAOrAn = (description: string, indexBeforeRedacted: number, lengthOfGiveaway: number, redaction: string, isA: boolean): string => {
  return replaceAt(description, indexBeforeRedacted + lengthOfGiveaway + (isA ? 0 : -1), ("(n) " + redaction), redaction.length + (isA ? 1 : 2));
}

const getAllIndexes = (description: string, search: string): number[] => {
  return [...description.matchAll(new RegExp(search, 'gi'))].map(a => a.index);
}

const hideAAndAnGiveaways = (description: string): string => {
  console.log("changing a and an to a(n) in ", description);
  let desc = description;
  const stringsToReplace = [" an ", "An ", " a ", "A "];
  stringsToReplace.forEach((aOrAnString, index) => {
    Object.entries(redactors).forEach(([key, value]) => {
      let indexesToReplace = getAllIndexes(desc, aOrAnString + value.escaped);
      indexesToReplace.forEach((indexToReplace) => {
        desc = replaceAOrAn(desc, indexToReplace, aOrAnString.length - 1, value.main, index > 1);
      })
    });
  });
  return desc;
};

const indexInDesc = (description: string, name: string): number => {
  return description.indexOf(name);
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
  description = description.replaceAll(name, redactors.pokemonRedactor.main);
  if (allPokemonNames.length > 0) {
    allPokemonNames.forEach(pokemonName => {
      description = description.replaceAll(pokemonName, redactors.pokemonRedactor.main);
    });
  }
  identifiableTerms.forEach(term => {
    const indexOfTerm = indexInDesc(description, term);
    if (indexOfTerm !== -1) {
      description = hideAAndAnGiveaways(replaceAt(description, indexOfTerm, redactors.defaultRedactor.main, term.length));
    }
  });
  regions.forEach(region => {
    description = description.replaceAll(region, redactors.regionRedactor.main);
  });
  locations.forEach(location => {
    description = description.replaceAll(location, redactors.locationRedactor.main);
  });
  return description;
};


/** Name formatting */
export const capitaliseName = (name: string): string => {
  var capitalisedName = "";
  formattedNames.forEach(formattedName => {
    if (formattedName.basic === name) {
      capitalisedName = formattedName.formatted;
    }
  });
  if (capitalisedName !== "") {
    return capitalisedName;
  }
  if (!name.includes(" ") && !name.includes("-")) {
    return name.substring(0, 1).toLocaleUpperCase() + name.substring(1);
  }
  var nameWithoutSymbols = "";
  const nameToFormat = name;
  if (nameToFormat.includes("-")) {
    var separatedDashName = nameToFormat.split("-");
    if (separatedDashName.length > 1) {
      separatedDashName.forEach((nameSection, index) => {
        nameWithoutSymbols =
          index === 0
            ? nameWithoutSymbols +
            nameSection.substring(0, 1).toLocaleUpperCase() +
            nameSection.substring(1)
            : nameWithoutSymbols +
            "-" +
            nameSection.substring(0, 1).toLocaleUpperCase() +
            nameSection.substring(1);
      });
    }
  }
  var nameWithoutForme = nameWithoutSymbols.toLocaleLowerCase()
    .includes("tapu-")
    ? nameWithoutSymbols.split("-").join(" ")
    : nameWithoutSymbols.toLocaleLowerCase().includes("o-o") ||
      nameWithoutSymbols === "Porygon-Z"
      ? nameWithoutSymbols
      : nameWithoutSymbols.split("-", 1)[0];
  return nameWithoutForme;
};

export const formatHeight = (height: number): string => {
  const inches = (height / 10) * 39.37;
  const feet = Math.floor(inches / 12);
  return (
    height / 10 +
    "m (" +
    feet +
    "ft " +
    Math.round(inches - feet * 12) +
    "in)"
  );
}

export const formatWeight = (weight: number): string => {
  return (
    weight / 10 +
    "kg (" +
    Math.round((weight / 10) * 2.2) +
    "lbs)"
  );
}