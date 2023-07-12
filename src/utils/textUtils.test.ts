import { dummyPokemonSpecies } from "./dummyPokemonResponses";
import { trimDescription } from "./textUtils";

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
});