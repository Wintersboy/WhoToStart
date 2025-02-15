"use client";

import Image from "next/image";
import useSWR from "swr";
import { useState } from "react";
import { Calendar } from "lucide-react";

import { fetcher } from "@/lib/utils/api";
import { formatGameDate } from "@/lib/utils/date";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { Card } from "./ui/Card";
import { Switch } from "./ui/Switch";
import { Label } from "./ui/Label";

const CURRENT_SEASON = 20242025;

export const stats = {
  goals: "G",
  assists: "A",
  points: "PTS",
  plusMinus: "+/-",
  penaltyMinutes: "PIM",
  shots: "SOG",
  hits: "HIT",
  blockedShots: "BLK",
};

type Player = {
  playerId: number;
  name: string;
  teamAbbrev: string;
};

type Matchup = {
  opponent: string;
  gameDate: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  shots: number;
  hits: number;
  blockedShots: number;
};

export type MatchUpStats = Omit<
  Matchup,
  "opponent" | "gamesPlayed" | "gameDate"
>;

const getPreviousSeason = (
  currentSeason: number,
  yearsBack: number
): number => {
  if (!yearsBack) return currentSeason;

  const startYear = Math.floor(currentSeason / 10000);
  const endYear = currentSeason % 10000;

  return (startYear - yearsBack) * 10000 + (endYear - yearsBack);
};

const useUpcomingGames = (
  playerId: number,
  teamAbbrev: string,
  yearsBack: string
) => {
  const previousSeason = getPreviousSeason(CURRENT_SEASON, Number(yearsBack));

  return useSWR<Matchup[]>(
    playerId && teamAbbrev
      ? `/api/upcomingGames?playerId=${playerId}&teamAbbrev=${teamAbbrev}&currentSeason=${CURRENT_SEASON}&previousSeason=${previousSeason}`
      : null,
    fetcher
  );
};

export const StatDisplay = ({
  label,
  value = 0,
  gamesPlayed,
  showAverage = false,
}: {
  label: string;
  value: number | undefined;
  gamesPlayed: number;
  showAverage?: boolean;
}) => {
  const displayValue = showAverage ? (value / gamesPlayed).toFixed(2) : value;

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-[50px]">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-base font-bold tabular-nums">
            {displayValue}
          </span>
        </div>
      </div>
    </div>
  );
};

const MatchupTotalsCard = ({
  matchups,
  showAverage,
}: {
  matchups: Matchup[] | undefined;
  showAverage: boolean;
}) => {
  const totalGamesPlayed = (matchups || []).reduce(
    (sum, matchup) => sum + (matchup.gamesPlayed || 0),
    0
  );

  return (
    <Card className="p-4 w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-lg">
          Performance {showAverage ? "Averages" : "Totals"}
        </span>
        <span className="text-sm text-muted-foreground">
          {totalGamesPlayed} GP
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-sm">
        {Object.entries(stats).map(([key, label]) => {
          const totalValue = matchups?.reduce(
            (sum, game) => sum + (game[key as keyof MatchUpStats] || 0),
            0
          );

          return (
            <StatDisplay
              key={key}
              label={label}
              value={totalValue}
              gamesPlayed={totalGamesPlayed}
              showAverage={showAverage}
            />
          );
        })}
      </div>
    </Card>
  );
};

const MatchupCard = ({
  matchup,
  showAverage,
}: {
  matchup: Matchup;
  showAverage: boolean;
}) => {
  const hasData = matchup?.gamesPlayed > 0;

  return (
    <div className="bg-muted/50 rounded-lg p-4 text-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Image
            src={`https://assets.nhle.com/logos/nhl/svg/${matchup.opponent}_light.svg`}
            alt={matchup.opponent}
            width={30}
            height={30}
          />
          <span className="font-medium text-lg">{matchup.opponent}</span>
          <span>•</span>
          <span className="text-sm text-muted-foreground">
            {formatGameDate(matchup.gameDate)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {matchup.gamesPlayed || 0} GP
        </span>
      </div>
      {hasData ? (
        <div className="grid grid-cols-4 gap-2 text-sm">
          {Object.entries(stats).map(([key, label]) => {
            const value = Number(matchup[key as keyof MatchUpStats]);
            return (
              <StatDisplay
                key={label}
                label={label}
                value={value}
                gamesPlayed={matchup.gamesPlayed}
                showAverage={showAverage}
              />
            );
          })}
        </div>
      ) : (
        <p className="py-1">No data available</p>
      )}
    </div>
  );
};

const MatchupHistory = ({
  matchups,
  playerName,
  showAverage,
}: {
  matchups: Matchup[] | undefined;
  playerName: string;
  showAverage: boolean;
}) => (
  <div className="flex flex-col space-y-2 h-full">
    <h3 className="font-semibold text-sm">
      {`${playerName}'s Performance vs Upcoming Opponents`}
    </h3>
    <div className="flex-grow space-y-4">
      {matchups?.map((matchup, index) => (
        <MatchupCard
          key={`${matchup.opponent}-${index}`}
          matchup={matchup}
          showAverage={showAverage}
        />
      ))}
    </div>
    <div className="h-0.5 w-full bg-gray-100 rounded-full" />
    <div className="mt-auto">
      <MatchupTotalsCard matchups={matchups} showAverage={showAverage} />
    </div>
  </div>
);

const UpcomingSchedule = ({
  playerOne,
  playerTwo,
}: {
  playerOne: Player;
  playerTwo: Player;
}) => {
  const [season, setSeason] = useState("0");
  const [showAverage, setShowAverage] = useState(false);

  const { data: upcomingGamesPlayerOne, isLoading: loadingPlayerOne } =
    useUpcomingGames(playerOne.playerId, playerOne.teamAbbrev, season);

  const { data: upcomingGamesPlayerTwo, isLoading: loadingPlayerTwo } =
    useUpcomingGames(playerTwo.playerId, playerTwo.teamAbbrev, season);

  const isLoading = loadingPlayerOne || loadingPlayerTwo;

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Upcoming Matchup History</h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a season" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="0">Current Season</SelectItem>
              <SelectItem value="3">Last 3 Seasons</SelectItem>
              <SelectItem value="5">Last 5 Seasons</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id="average"
            checked={showAverage}
            onCheckedChange={setShowAverage}
          />
          <Label htmlFor="average">Show Averages</Label>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 ">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            <MatchupHistory
              matchups={upcomingGamesPlayerOne}
              playerName={playerOne.name}
              showAverage={showAverage}
            />
            <MatchupHistory
              matchups={upcomingGamesPlayerTwo}
              playerName={playerTwo.name}
              showAverage={showAverage}
            />
          </>
        )}
      </div>
    </>
  );
};

export default UpcomingSchedule;
