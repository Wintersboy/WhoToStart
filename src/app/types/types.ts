export interface SeasonParams {
  isAggregate: boolean;
  isGame: boolean;
  sort?: { property: string; direction: string }[];
  start: number;
  limit: number;
  factCayenneExp?: string;
  cayenneExp: string;
}

export type PlayerStats = {
  gameId?: string;
  gamesPlayed: number;
  pointsPerGame: number;
  points: number;
  goals: number;
  assists: number;
  penaltyMinutes: number;
  plusMinus: number;
  shots: number;
  blockedShots: number;
  hits: number;
  faceoffWinPct: number;
  totalFaceoffWins: number;
  totalFaceoffLosses: number;
};
