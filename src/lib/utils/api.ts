import { SeasonParams } from "@/app/types/types";

const NHL_API_BASE = "https://api.nhle.com/stats/rest/en/skater";

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error fetching data: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return response.json();
};

export const createURLWithParams = (
  baseURL: string,
  params: SeasonParams
): URL => {
  const url = new URL(baseURL);
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === "sort") {
      searchParams.append(key, JSON.stringify(value));
    } else {
      searchParams.append(key, String(value));
    }
  });

  url.search = searchParams.toString();
  return url;
};

export const fetchPlayerSummary = async (params: SeasonParams) => {
  const url = createURLWithParams(`${NHL_API_BASE}/summary`, params);
  const response = await fetch(url.toString());
  return response.json();
};

export const fetchPlayerRealtime = async (params: SeasonParams) => {
  const url = createURLWithParams(`${NHL_API_BASE}/realtime`, params);
  const response = await fetch(url.toString());
  return response.json();
};

export const fetchPlayerFaceoffWins = async (params: SeasonParams) => {
  const url = createURLWithParams(`${NHL_API_BASE}/faceoffwins`, params);
  const response = await fetch(url.toString());
  return response.json();
};

export const fetchPlayerBio = async (params: SeasonParams) => {
  const url = createURLWithParams(`${NHL_API_BASE}/bios`, params);
  const response = await fetch(url.toString());
  return response.json();
};

export const fetchPlayerStats = async (params: SeasonParams) =>
  await Promise.all([
    fetchPlayerSummary(params),
    fetchPlayerRealtime(params),
    fetchPlayerFaceoffWins(params),
    fetchPlayerBio(params),
  ]);
