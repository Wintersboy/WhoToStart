"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { History, Trophy } from "lucide-react";

import { fetcher } from "@/lib/utils/api";

import { Card } from "@/components/ui/Card";
import { CustomSelect } from "@/components/AutocompleteInput";
import RecentGamesTable from "@/components/RecentGamesTable";
import UpcomingSchedule from "@/components/UpcomingSchedule";

import "./globals.css";

interface Player {
  playerId: number;
  name: string;
  teamAbbrev: string;
  sweaterNumber?: number;
  positionCode?: string;
}

type PlayerStats = {
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

const labels: { [key in keyof PlayerStats]: string } = {
  gamesPlayed: "GP",
  pointsPerGame: "P/GP",
  points: "PTS",
  goals: "G",
  assists: "A",
  penaltyMinutes: "PIM",
  plusMinus: "+/-",
  shots: "SOG",
  blockedShots: "BLK",
  hits: "HIT",
  faceoffWinPct: "FOW%",
  totalFaceoffWins: "FOW",
  totalFaceoffLosses: "FOL",
  // evGoals: "Even Strength Goals",
  // evPoints: "Even Strength Points",
  // gameWinningGoals: "Game Winning Goals",
  // lastName: "Last Name",
  // otGoals: "Overtime Goals",
  // playerId: "Player ID",
  // positionCode: "Position Code",
  // ppGoals: "Power Play Goals",
  // ppPoints: "Power Play Points",
  // seasonId: "Season ID",
  // shGoals: "Short-Handed Goals",
  // shPoints: "Short-Handed Points",
  // shootingPct: "Shooting Percentage",
  // shootsCatches: "Shoots/Catches",
  // teamAbbrev: "Team Abbreviation",
  // timeOnIcePerGame: "Time on Ice Per Game",
};

const StatComparison = ({
  label,
  value1,
  value2,
}: {
  label: string;
  value1: number;
  value2: number;
}) => {
  const ommitedStats = ["GP"];
  const isValue1Higher = value1 > value2 && !ommitedStats.includes(label);
  const isValue2Higher = value2 > value1 && !ommitedStats.includes(label);

  const toFixed = ["P/GP", "FOW%"].includes(label) ? 1 : 0;

  return (
    <div className="grid grid-cols-3 gap-4 py-2">
      <div
        className={`text-right ${
          isValue1Higher ? "text-green-600 font-semibold" : ""
        }`}
      >
        {value1?.toFixed(toFixed)}
      </div>
      <div className="text-center text-sm text-muted-foreground">{label}</div>
      <div
        className={`text-left ${
          isValue2Higher ? "text-green-600 font-semibold" : ""
        }`}
      >
        {value2?.toFixed(toFixed)}
      </div>
    </div>
  );
};

const PlayerHeader = ({
  player,
  align = "start",
}: {
  player: Player;
  align: string;
}) => {
  const { playerId, name, teamAbbrev, sweaterNumber, positionCode } = player;

  return (
    <>
      <Image
        src={`https://assets.nhle.com/mugs/nhl/20242025/${teamAbbrev}/${playerId}.png`}
        alt={name}
        width={75}
        height={75}
        className="rounded-full border border-gray-200 bg-gray-100"
      />
      <div>
        <h2 className="text-xl font-bold mb-1">{name}</h2>
        <div
          className={`flex items-center ${
            align === "end" ? "justify-end" : "justify-start"
          } gap-2`}
        >
          <Image
            width={30}
            height={30}
            src={`https://assets.nhle.com/logos/nhl/svg/${teamAbbrev}_light.svg`}
            alt={teamAbbrev}
          />
          <div className="border-l border-gray-300 h-3"></div>
          <p className="font-medium text-lg"># {sweaterNumber}</p>
          <div className="border-l border-gray-300 h-3"></div>
          <p className="font-medium text-lg">{positionCode}</p>
        </div>
      </div>
    </>
  );
};

const usePlayerStats = (endpoint: string, player: Player) => {
  const currentSeason = 20242025;
  const { data, isLoading, error } = useSWR(
    player
      ? `/api/${endpoint}?playerId=${player.playerId}&currentSeason=${currentSeason}`
      : null,
    fetcher
  );

  return [data, isLoading, error];
};

const StatComparisonList = ({
  playerOne,
  playerTwo,
}: {
  playerOne: Player;
  playerTwo: Player;
}) => {
  const [stats1, loading1] = usePlayerStats("seasonStats", playerOne);
  const [stats2, loading2] = usePlayerStats("seasonStats", playerTwo);

  if (loading1 || loading2) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-0">
      {Object.entries(labels).map(([key, label]) => (
        <StatComparison
          key={key}
          label={label}
          value1={stats1[key as keyof Player]}
          value2={stats2[key as keyof Player]}
        />
      ))}
    </div>
  );
};

const RecentGamesCard = ({
  playerOne,
  playerTwo,
}: {
  playerOne: Player;
  playerTwo: Player;
}) => {
  const [stats1, loading1] = usePlayerStats("recentGames", playerOne);
  const [stats2, loading2] = usePlayerStats("recentGames", playerTwo);

  if (loading1 || loading2) {
    return <p>Loading...</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-6">
      <RecentGamesTable games={stats1} playerName={playerOne.name} />
      <RecentGamesTable games={stats2} playerName={playerTwo.name} />
    </div>
  );
};

export default function Home() {
  const [playerOne, setPlayerOne] = useState<Player | null>(null);
  const [playerTwo, setPlayerTwo] = useState<Player | null>(null);

  return (
    <div className="flex justify-center items-center flex-col m-4 mb-12">
      <h1 className="text-center my-6 text-2xl font-bold">Who to start?</h1>
      <div className="grid md:grid-cols-2 gap-4 w-full max-w-3xl mb-6">
        <CustomSelect onSelect={setPlayerOne} />
        <CustomSelect onSelect={setPlayerTwo} />
      </div>

      {playerOne && playerTwo && (
        <>
          <Card className="p-6 w-full max-w-3xl mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-end gap-2 text-right">
                <PlayerHeader player={playerOne} align="end" />
              </div>
              <div className="flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col items-start gap-2 text-left">
                <PlayerHeader player={playerTwo} align="start" />
              </div>
            </div>
            <div className="h-0.5 w-full bg-gray-100 rounded-full mb-3" />
            <StatComparisonList playerOne={playerOne} playerTwo={playerTwo} />
          </Card>
          <Card className="p-6 w-full max-w-3xl mb-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Recent Performance</h2>
            </div>
            <RecentGamesCard playerOne={playerOne} playerTwo={playerTwo} />
          </Card>
          <Card className="p-6 w-full max-w-3xl">
            <UpcomingSchedule playerOne={playerOne} playerTwo={playerTwo} />
          </Card>
        </>
      )}
    </div>
  );
}
