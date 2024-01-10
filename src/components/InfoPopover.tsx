import React from "react";
import { PopoverContainer, PopoverContent } from "../styles";

export const InfoPopover = ({ updateTheme }) => {
  return (<PopoverContainer className="info popover-container">
    <PopoverContent className="popover-content">
      <div onClick={() => updateTheme()}><span className="link">Change theme</span></div>
      <p>Generations 1-9 supported (Dex numbers 0001-1008, excluding Walking Wake & Iron Leaves)</p>
      <p>[POKÉMON] replaces any Pokémon's name in the target Pokémon's description.
        [REDACTED] will hide giveaway terms, eg Legendary, Ultra Beast, etc.
        Locations, regions and their identifiers, eg Alola and Alolan, will also be hidden.
      </p>
      <p>
        Gender symbols in guesses can be substituted with M/F as
        appropriate. eg, `[Pokémon]M` will be accepted for
        `[Pokémon]♂`
      </p>
      <p>
        All other symbols will be ignored. eg, a Pokémon name with a -
        will be accepted without the - included
      </p>
      <p>
        Pokémon with formes will have the formes dropped from their
        name. eg, `[Pokémon]` will be accepted for `[Pokémon] -
        [forme]`
      </p>
      <p>Data provided by pokedex-api</p>
    </PopoverContent>
  </PopoverContainer>);
};