export interface SeasonParams {
  isAggregate: boolean;
  isGame: boolean;
  sort?: { property: string; direction: string }[];
  start: number;
  limit: number;
  factCayenneExp?: string;
  cayenneExp: string;
}

export interface PlayerStats {
  gameId?: string;
  // Add other common properties here
  [key: string]: any;
}
