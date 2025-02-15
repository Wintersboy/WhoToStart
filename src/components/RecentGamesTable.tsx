import Image from "next/image";

import { formatGameDate } from "@/lib/utils/date";

import { MatchUpStats, StatDisplay, stats } from "./UpcomingSchedule";

interface GameStats {
  date: string;
  opponent: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  plusMinus: number;
  shots: number;
  blockedShots: number;
  hits: number;
  faceoffWinPct: number;
  timeOnIcePerGame: number;
  opponentTeamAbbrev: string;
  gameDate: string;
}

const secondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const RecentGamesTable = ({
  games,
  playerName,
}: {
  games: GameStats[];
  playerName: string;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{`${playerName}'s Last 5 Games`}</h3>
      <div className="space-y-4">
        {(games || []).map((game, index) => (
          <div
            key={index}
            className="bg-muted/50 rounded-lg p-4 text-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src={`https://assets.nhle.com/logos/nhl/svg/${game.opponentTeamAbbrev}_light.svg`}
                  alt={game.opponentTeamAbbrev}
                  width={30}
                  height={30}
                />
                <span className="font-medium text-lg">
                  {game.opponentTeamAbbrev}
                </span>
                <span>•</span>
                <span className="text-sm text-muted-foreground">
                  {formatGameDate(game.gameDate)}
                </span>
              </div>

              <span className="text-sm text-muted-foreground">
                {secondsToMinutes(game.timeOnIcePerGame)} TOI
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              {Object.entries(stats).map(([key, label]) => {
                const value = Number(game[key as keyof MatchUpStats]);
                return (
                  <StatDisplay
                    key={label}
                    label={label}
                    value={value}
                    gamesPlayed={game.gamesPlayed}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentGamesTable;
