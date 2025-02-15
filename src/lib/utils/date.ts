export const formatSeasonDate = (
  date: Date,
  includeTime: boolean = false
): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  if (includeTime) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else {
    return `${year}-${month}-${day}`;
  }
};

export const formatGameDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const getDateWithOffset = (
  daysBack: number,
  includeTime: boolean = false
): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  if (includeTime) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
};
