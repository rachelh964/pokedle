import { storeTheme } from "./storageUtils";

export interface Theme {
  primary: string;
  secondary: string;
  tertiary: string;
  text: string;
}

export const Themes: Theme[] = [
  {
    primary: "#9b4bff55",
    secondary: "#ff00ff99",
    tertiary: "#9b4bff22",
    text: "#ffffffcc"
  },
  {
    primary: "#ff000066",
    secondary: "#888888dd",
    tertiary: "#ff000044",
    text: "#ffffffcc"
  },
  {
    primary: "#0b00ff66",
    secondary: "#e74545cc",
    tertiary: "#0b00ff33",
    text: "#ffffffcc"
  },
  {
    primary: "#88888855",
    secondary: "#dfc000ee",
    tertiary: "#88888822",
    text: "#000000cc"
  }
];

export const getNewTheme = (currentTheme: Theme): Theme => {
  const currentIndex = Themes.findIndex((theme) => theme === currentTheme);
  let themeToSet = Themes[0];
  if (currentIndex < 3) {
    themeToSet = Themes[currentIndex + 1];
  }
  storeTheme(themeToSet);
  return themeToSet;
}