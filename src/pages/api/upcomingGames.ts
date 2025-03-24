import { NextApiRequest, NextApiResponse } from "next";

import { SeasonParams } from "@/app/types/types";
import { fetchPlayerStats } from "@/lib/utils/api";

type Game = {
  gameId: number;
  gameDate: string;
  homeTeam: {
    abbrev: string;
    id: number;
  };
  awayTeam: {
    abbrev: string;
    id: number;
  };
};

type GameStats = {
  opponent: string;
  gameDate: string;
  gamesPlayed: number;
  timeOnIcePerGame: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  shots: number;
  hits: number;
  blockedShots: number;
};

const formatStats = (stats: GameStats) => ({
  opponent: stats.opponent,
  gameDate: stats.gameDate,
  timeOnIcePerGame: stats.timeOnIcePerGame,
  gamesPlayed: stats.gamesPlayed,
  goals: stats.goals,
  assists: stats.assists,
  points: stats.points,
  plusMinus: stats.plusMinus,
  penaltyMinutes: stats.penaltyMinutes,
  shots: stats.shots,
  hits: stats.hits,
  blockedShots: stats.blockedShots,
});

const getStartOfWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(today.setDate(diff));
  const formattedDate = monday.toISOString().split("T")[0];
  return formattedDate;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { playerId, teamAbbrev, currentSeason, previousSeason } = req.query;

  const formattedDate = getStartOfWeek();

  const schedule = await fetch(
    `https://api-web.nhle.com/v1/club-schedule/${teamAbbrev}/week/${formattedDate}`
  );

  const data = await schedule.json();

  const opponents = (data?.games || []).reduce(
    (opp: { id: number; abbrev: string; gameDate: string }[], game: Game) => {
      const { homeTeam, awayTeam, gameDate } = game;
      if (homeTeam.abbrev === teamAbbrev) {
        opp.push({
          id: awayTeam.id,
          abbrev: awayTeam.abbrev,
          gameDate,
        });
      } else {
        opp.push({
          id: homeTeam.id,
          abbrev: homeTeam.abbrev,
          gameDate,
        });
      }
      return opp;
    },
    []
  );

  const fetchPromises = opponents.map(
    async ({
      id,
      abbrev,
      gameDate,
    }: {
      id: number;
      abbrev: string;
      gameDate: string;
    }) => {
      const params: SeasonParams = {
        isAggregate: true,
        isGame: false,
        start: 0,
        limit: 50,
        cayenneExp: `playerId=${playerId} and opponentTeamId=${id} and gameTypeId=2 and seasonId<=${currentSeason} and seasonId>=${previousSeason}`,
      };

      const [summary, realtime, faceoffWins, bio] = await fetchPlayerStats(
        params
      );

      return formatStats({
        opponent: abbrev,
        gameDate,
        ...summary.data[0],
        ...realtime.data[0],
        ...faceoffWins.data[0],
        ...bio.data[0],
      });
    }
  );

  try {
    const results = await Promise.all(fetchPromises);
    const combinedResults = results.flat();

    res.status(200).json(combinedResults);
  } catch (error) {
    res.status(500).json({ message: "Error fetching player stats", error });
  }
};

export default handler;
