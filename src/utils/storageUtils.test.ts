import { storePokemonNames, fetchPokemonNamesFromStorage, fetchScoreFromLocalStorage, storeScore } from "./storageUtils";
import { defaultScore } from "./scoreUtils";

var localStorageMock = (function () {
  var store: any = {};
  return {
    getItem: function (key: string | number) {
      return store[key];
    },
    setItem: function (key: string | number, value: { toString: () => any; }) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string | number) {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe("storageUtils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("storePokemonNames", () => {
    it("should store to localStorage when storePokemonNames is called", () => {
      storePokemonNames([]);
      expect(localStorage.getItem("pokedle_pokemonNames")).toEqual("[]");
    });
  });

  describe("fetchPokemonNamesFromStorage", () => {
    it("should get an empty array when fetchPokemonNames is called without calling storePokemonNames first", () => {
      const storedItem = fetchPokemonNamesFromStorage();
      expect(storedItem).toEqual(JSON.parse("[]"));
    });

    it("should return a pokemon array from localStorage when storePokemonNames is called before fetchPokemonNames", () => {
      storePokemonNames(["Bulbasaur", "Ivysaur", "Venusaur"]);
      const storedItem = fetchPokemonNamesFromStorage();
      expect(storedItem).toEqual(["Bulbasaur", "Ivysaur", "Venusaur"]);
    });
  });

  describe("storeScore", () => {
    it("should store to localStorage when storeScore is called", () => {
      storeScore(defaultScore);
      expect(localStorage.getItem("pokedle_score")).toEqual(JSON.stringify(defaultScore));
    });
  });

  describe("fetchScoreFromLocalStorage", () => {
    it("should return the default score object when no score is stored on localStorage", () => {
      expect(fetchScoreFromLocalStorage()).toEqual(defaultScore);
    });

    it("should return a set score object when one has been stored on localStorage", () => {
      storeScore(defaultScore);
      expect(fetchScoreFromLocalStorage()).toEqual(defaultScore);
    });
  });
});
