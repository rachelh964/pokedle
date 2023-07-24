import { dummyPokemonSpecies } from "./dummyPokemonResponses";
import { capitaliseName, trimDescription, formatHeight, formatWeight } from "./textUtils";
import { formattedNames, FormattedPokemonName } from "../context/Terminology";

const setUpFlavorText = (description: string) => {
  return [{ flavorText: description, language: { name: "en", url: "" }, version: { name: "", url: "" } }];
}

describe("textUtils", () => {
  describe("trimDescription", () => {
    it("should replace chosen pokemon's name within a string", () => {
      const description = "This is a description with the chosen pokemon's name Tauros in it.";
      let pokemonSpecies = dummyPokemonSpecies;
      pokemonSpecies.flavorTextEntries = setUpFlavorText(description);
      expect(trimDescription(pokemonSpecies, [])).toEqual("This is a description with the chosen pokemon's name [POKÉMON] in it.");
    });

    it("should replace multiple of the chosen pokemon's name within a string", () => {
      const description = "This description has Tauros appearing Tauros multiple Tauros times.";
      let pokemonSpecies = dummyPokemonSpecies;
      pokemonSpecies.flavorTextEntries = setUpFlavorText(description);
      expect(trimDescription(pokemonSpecies, [])).toEqual("This description has [POKÉMON] appearing [POKÉMON] multiple [POKÉMON] times.");
    });

    it("should replace many different pokemon names within a string", () => {
      const description = "This description has Ditto, Porygon and Snorlax all within Tauros's description. Also Jynx.";
      let pokemonSpecies = dummyPokemonSpecies;
      pokemonSpecies.flavorTextEntries = setUpFlavorText(description);
      expect(trimDescription(pokemonSpecies, ["Jynx", "Tauros", "Ditto", "Porygon", "Snorlax"])).toEqual("This description has [POKÉMON], [POKÉMON] and [POKÉMON] all within [POKÉMON]'s description. Also [POKÉMON].")
    });

    it("should replace any regions mentioned within a string", () => {
      const description = "This description mentions the Hoenn, Kalos and Kanto regions for some reason.";
      let pokemonSpecies = dummyPokemonSpecies;
      pokemonSpecies.flavorTextEntries = setUpFlavorText(description);
      expect(trimDescription(pokemonSpecies, [])).toEqual("This description mentions the [REGION], [REGION] and [REGION] regions for some reason.");
    });

    it("should replace sub locations (islands in Alola) within a string", () => {
      const description = "Alola has locations including Ula’ula, Poni, Melemele and some other one I can't remember.";
      let pokemonSpecies = dummyPokemonSpecies;
      pokemonSpecies.flavorTextEntries = setUpFlavorText(description);
      expect(trimDescription(pokemonSpecies, [])).toEqual("[REGION] has locations including [LOCATION], [LOCATION], [LOCATION] and some other one I can't remember.");
    });

    it("should replace region- or pokemon-identifying terms within a string", () => {
      const description = "In the case of a guardian deity, we want to hide the fact that an Primal Reversion makes it able to Mega Evolve into Team Plasma.";
      let pokemonSpecies = dummyPokemonSpecies;
      pokemonSpecies.flavorTextEntries = setUpFlavorText(description);
      expect(trimDescription(pokemonSpecies, [])).toEqual("In the case of a(n) [REDACTED], we want to hide the fact that a(n) [REDACTED] makes it able to [REDACTED] into [REDACTED].");
    });
  });

  describe("capitaliseName", () => {
    it("should replace pokemon from the formattedName list with their capitalised hardcoded names", () => {
      formattedNames.forEach((nameToFormat: FormattedPokemonName) => {
        expect(capitaliseName(nameToFormat.basic)).toEqual(nameToFormat.formatted);
      });
    });

    it("should capitalise straightforward pokemon names (without spaces or symbols)", () => {
      const easyNames = ["bulbasaur", "charmander", "squirtle"];
      easyNames.forEach((nameToFormat) => {
        const capitalisedName = nameToFormat.charAt(0).toUpperCase()
          + nameToFormat.slice(1)
        expect(capitaliseName(nameToFormat)).toEqual(capitalisedName);
      });
    });

    it("should capitalise both sides of dashes in pokemon names with dashes", () => {
      // every other dashed entry is in formatted names (jangmo-o, etc) or formes (nidoran-m, etc)
      const dashedName = "ho-oh";
      expect(capitaliseName(dashedName)).toEqual("Ho-Oh");
    });

    it("should drop everything after the first dash for alternate formes", () => {
      const formeNames = ["deoxys-normal", "giratina-altered", "basculin-red-striped"];
      formeNames.forEach((formeName) => {
        const capitalisedName = formeName.charAt(0).toUpperCase()
          + formeName.slice(1).split("-")[0];
        expect(capitaliseName(formeName)).toEqual(capitalisedName);
      });
    });
  });

  describe("formatHeight", () => {
    it("should format heights correctly", () => {
      const heights = [{ basic: 2, formatted: "0.2m (0ft 8in)" }, { basic: 48, formatted: "4.8m (15ft 9in)" }, { basic: 110, formatted: "11m (36ft 1in)" }, { basic: 650, formatted: "65m (213ft 3in)" }];
      heights.forEach((height) => {
        expect(formatHeight(height.basic)).toEqual(height.formatted);
      });
    });
  });

  describe("formatWeight", () => {
    it("should format weights correctly", () => {
      const weights = [{ basic: 2, formatted: "0.2kg (0lbs)" }, { basic: 48, formatted: "4.8kg (11lbs)" }, { basic: 110, formatted: "11kg (24lbs)" }, { basic: 650, formatted: "65kg (143lbs)" }];
      weights.forEach((weight) => {
        expect(formatWeight(weight.basic)).toEqual(weight.formatted);
      });
    });
  });
});