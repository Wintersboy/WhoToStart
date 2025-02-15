"use client";

import { useEffect, useRef, useState } from "react";

const useDebounceValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

type Player = {
  playerId: number;
  name: string;
  teamAbbrev: string;
};

interface CustomSelectProps {
  onSelect: (player: Player | null) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ onSelect }) => {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedInput = useDebounceValue(input, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchPlayers = async () => {
      const url = new URL(
        `https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=20&q=${debouncedInput}%2A&active=true`
      );
      const response = await fetch(url);
      const data = await response.json();

      setPlayers(data);
    };

    if (debouncedInput.length >= 3) {
      searchPlayers();
    } else {
      setPlayers([]);
    }
  }, [debouncedInput]);

  const handleSelect = (player: Player) => {
    onSelect(player);
    setInput(player.name);
    setPlayers([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setInput("");
    setPlayers([]);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 100); // Delay to allow click event to register
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <input
        className="text-slate-700 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
        type="text"
        placeholder="Search for a player"
        value={input}
        onChange={e => setInput(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {input && (
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={handleClear}
        >
          &times;
        </button>
      )}
      {isOpen && players?.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 text-center text-gray-500">No results found</div>
        </div>
      )}
      {isOpen && players?.length > 0 && (
        <ul className="absolute z-10 text-slate-700 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-auto max-h-60">
          {players.map(player => (
            <li
              key={player.playerId}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelect(player)}
            >
              {player.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
