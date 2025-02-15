import { PlayerStats } from "@/app/types/types";

export const mergeGameData = (arrays: PlayerStats[][]): PlayerStats[] => {
  const gameMap: { [key: string]: PlayerStats } = {};

  arrays.forEach(array => {
    array.forEach(game => {
      const gameId = game.gameId;
      if (!gameId) return;

      if (!gameMap[gameId]) {
        gameMap[gameId] = { ...game };
      } else {
        gameMap[gameId] = { ...gameMap[gameId], ...game };
      }
    });
  });

  return Object.values(gameMap);
};
