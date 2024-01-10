import React, { useEffect, useRef, useState } from "react";
import { BsCheckLg } from "react-icons/bs";
import { Button, Input } from "../styles";

const SearchableDropdown = ({
  options,
  id,
  selectedGuess,
  handleChange,
  submitGuess,
  theme
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    document.addEventListener("click", toggle);
    return () => document.removeEventListener("click", toggle);
  }, []);

  const selectOption = option => {
    setQuery(() => "");
    handleChange(option);
    setIsOpen(isOpen => !isOpen);
  };

  function toggle(e) {
    setIsOpen(e && e.target === inputRef.current);
  }

  const getDisplayValue = () => {
    if (query) return query;
    if (selectedGuess) return selectedGuess;

    return "";
  };

  const filter = options => {
    return options.filter(
      option => option.toLowerCase().indexOf(query.toLowerCase()) > -1
    );
  };

  return (
    <div className="dropdown">
      <div className="control">
        <div className="selected-value">
          <Input
            ref={inputRef}
            type="text"
            value={getDisplayValue()}
            name="searchTerm"
            onChange={e => {
              setQuery(e.target.value);
              handleChange(null);
            }}
            onClick={toggle}
            onKeyDown={e =>
              e.key === "Enter" &&
              (submitGuess(), setQuery(""), handleChange(null))
            }
            id={id}
            autoComplete="off"
          />
        </div>
        <div className={`arrow ${isOpen ? "open" : ""}`}></div>
        <Button
          className="input-button"
          type="submit"
          onClick={() => (submitGuess(), setQuery(""), handleChange(null))}
        >
          <BsCheckLg color={theme.secondary} />
        </Button>
      </div>

      {filter(options).length > 0 && (
        <div className="options-container">
          <div className={`options ${isOpen ? "open" : ""}`}>
            {filter(options).map((option, index) => {
              return (
                <div
                  onClick={() => selectOption(option)}
                  className={`option ${option === selectedGuess ? "selected" : ""
                    }`}
                  key={`${id}-${index}`}
                >
                  {option}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
