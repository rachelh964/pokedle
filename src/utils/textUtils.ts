import { PokemonSpecies } from "../context/Pokemon";
import { formattedNames, identifiableTerms, locations, regions } from "../context/Terminology";
import { getDescription } from "./pokemonUtils";

const redacted = "[REDACTED]"
const redactedPokemon = "[POKÉMON]";
const redactedRegion = "[REGION]";
const redactedLocation = "[LOCATION]";

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

const replaceAOrAn = (description: string, indexBeforeRedacted: number, isA: boolean, redaction: string): string => {
  return replaceAt(description, indexBeforeRedacted + (isA ? 2 : 1), ("(n) " + redaction), redaction.length);
}

const hideAAndAnGiveaways = (description: string): string => {
  console.log("changing a and an to a(n) in ", description);
  let desc = description;
  const stringsToReplace = [" an ", "An ", " a ", "A "];
  stringsToReplace.forEach((aOrAnString) => {
    let indexToReplace = desc.indexOf(aOrAnString + redactedPokemon);
    if (indexToReplace !== -1) {
      desc = replaceAOrAn(desc, indexToReplace, false, redactedPokemon);
    }
    desc.indexOf(aOrAnString + redactedRegion);
    if (indexToReplace !== -1) {
      desc = replaceAOrAn(desc, indexToReplace, false, redactedRegion);
    }
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
  console.log("checking for ", name, " in ", description);
  const indexOfName = indexInDesc(description, name);
  if (indexOfName !== -1) {
    description = replaceAt(description, indexOfName, redactedPokemon, name.length);
  }
  if (allPokemonNames.length > 0) {
    allPokemonNames.forEach(pokemonName => {
      description = description.replaceAll(pokemonName, redactedPokemon);
    });
  }
  identifiableTerms.forEach(term => {
    const indexOfTerm = indexInDesc(description, term);
    if (indexOfTerm !== -1) {
      description = hideAAndAnGiveaways(replaceAt(description, indexOfTerm, redacted, term.length));
    }
  });
  regions.forEach(region => {
    description = description.replaceAll(region, redactedRegion);
  });
  locations.forEach(location => {
    description = description.replaceAll(location, redactedLocation);
  });
  return description;
};


/** Name formatting */
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
  var nameWithoutForme = combinedName.toLocaleLowerCase()
    .includes("tapu-")
    ? combinedName.split("-").join(" ")
    : combinedName.toLocaleLowerCase().includes("o-o") ||
      combinedName === "Porygon-Z"
      ? combinedName
      : combinedName.split("-", 1)[0];
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