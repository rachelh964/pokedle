import { dummyPokemon, dummyPokemonSpecies } from "./dummyPokemonResponses"
import { displayAbilities, getDescription } from "./pokemonUtils";

describe("pokemonUtils", () => {
  it("getDescription should return the correct (top) description", () => {
    const expectedDescription = "The Tauros of the Galar region are volatile in\nnature, and they won’t allow people to ride on\ntheir backs.";
    expect(getDescription(dummyPokemonSpecies)).toEqual(expectedDescription);
  });

  it("displayAbilities should list all abilities as expected", () => {
    expect(displayAbilities([])).toEqual("None");
    const expectedDummyAbilities = "Intimidate, Anger Point, Sheer Force";
    expect(displayAbilities(dummyPokemon.abilities)).toEqual(expectedDummyAbilities);
  });

  // Also fetch methods?
})