export interface Score {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  played: number;
  winTotal: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
}

export const defaultScore: Score = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "played": 0,
  "winTotal": 0,
  "winPercentage": 0,
  "currentStreak": 0,
  "maxStreak": 0
}

export const updateScore = (hintsNeeded: number): Score => {
  const existingScore: Score | null = JSON.parse(
    localStorage.getItem("pokedle_score")
  );

  const scoreToUse: Score = existingScore || defaultScore;
  const winIncrement: number = hintsNeeded <= 6 ? 1 : 0;

  return {
    1: scoreToUse[1] + incrementScore(hintsNeeded, 1),
    2: scoreToUse[2] + incrementScore(hintsNeeded, 2),
    3: scoreToUse[3] + incrementScore(hintsNeeded, 3),
    4: scoreToUse[4] + incrementScore(hintsNeeded, 4),
    5: scoreToUse[5] + incrementScore(hintsNeeded, 5),
    6: scoreToUse[6] + incrementScore(hintsNeeded, 6),
    played: scoreToUse.played + 1,
    winTotal: scoreToUse.winTotal + winIncrement,
    winPercentage: Math.ceil(
      ((scoreToUse.winTotal + winIncrement) / (scoreToUse.played + 1)) * 100
    ),
    currentStreak: winIncrement ? scoreToUse.currentStreak + 1 : 0,
    maxStreak:
      scoreToUse.currentStreak + winIncrement > scoreToUse.maxStreak
        ? scoreToUse.currentStreak + winIncrement
        : scoreToUse.maxStreak
  };
};

export const incrementScore = (
  hintsNeeded: number,
  scoreToIncrement: number
): number => {
  return hintsNeeded === scoreToIncrement ? 1 : 0;
};
