import { NextApiRequest, NextApiResponse } from "next";

import { SeasonParams } from "@/app/types/types";
import { fetchPlayerStats } from "@/lib/utils/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { playerId, currentSeason } = req.query;

  if (!playerId || !currentSeason) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters" });
  }

  const params: SeasonParams = {
    isAggregate: true,
    isGame: false,
    start: 0,
    limit: 50,
    factCayenneExp: "gamesPlayed>=1",
    cayenneExp: `playerId=${playerId} and gameTypeId=2 and seasonId=${currentSeason}`,
  };

  try {
    const [summary, realtime, faceoffWins, bio] = await fetchPlayerStats(
      params
    );

    res.status(200).json({
      ...summary.data[0],
      ...realtime.data[0],
      ...faceoffWins.data[0],
      ...bio.data[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching player stats", error });
  }
};

export default handler;
