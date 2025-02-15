import { NextApiRequest, NextApiResponse } from "next";

import { fetchPlayerStats } from "@/lib/utils/api";
import { mergeGameData } from "@/lib/utils/data";
import { formatSeasonDate, getDateWithOffset } from "@/lib/utils/date";

interface SeasonParams {
  isAggregate: boolean;
  isGame: boolean;
  sort?: { property: string; direction: string }[];
  start: number;
  limit: number;
  factCayenneExp?: string;
  cayenneExp: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { playerId } = req.query;

  if (!playerId) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters" });
  }

  const formattedTodaysDateEndOfDay = formatSeasonDate(
    getDateWithOffset(0, true)
  );

  const formattedSevenDaysAgoStartOfDay = formatSeasonDate(
    getDateWithOffset(7)
  );

  const params: SeasonParams = {
    isAggregate: false,
    isGame: true,
    start: 0,
    limit: 50,
    cayenneExp: `playerId=${playerId} and gameDate<="${formattedTodaysDateEndOfDay}" and gameDate>="${formattedSevenDaysAgoStartOfDay}" and gameTypeId=2`,
  };

  try {
    const [summary, realtime, faceoffWins, bio] = await fetchPlayerStats(
      params
    );

    const mergedData = mergeGameData([
      summary.data,
      realtime.data,
      faceoffWins.data,
      bio.data,
    ]);

    res.status(200).json(mergedData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching player stats", error });
  }
};

export default handler;
