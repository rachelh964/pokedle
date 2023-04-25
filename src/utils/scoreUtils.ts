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

export const updateScore = (hintsNeeded: number): void => {
  const isAWin: number = hintsNeeded <= 6 ? 1 : 0;

  const existingScore: Score | null = JSON.parse(
    localStorage.getItem("pokedle_score")
  );
  if (existingScore) {
    localStorage.setItem(
      "pokedle_score",
      JSON.stringify({
        1: existingScore[1] + incrementScore(hintsNeeded, 1),
        2: existingScore[2] + incrementScore(hintsNeeded, 2),
        3: existingScore[3] + incrementScore(hintsNeeded, 3),
        4: existingScore[4] + incrementScore(hintsNeeded, 4),
        5: existingScore[5] + incrementScore(hintsNeeded, 5),
        6: existingScore[6] + incrementScore(hintsNeeded, 6),
        played: existingScore.played + 1,
        winTotal: existingScore.winTotal + isAWin,
        winPercentage: Math.ceil(
          ((existingScore.winTotal + isAWin) / (existingScore.played + 1)) * 100
        ),
        currentStreak: isAWin ? existingScore.currentStreak + 1 : 0,
        maxStreak:
          existingScore.currentStreak + isAWin > existingScore.maxStreak
            ? existingScore.currentStreak + isAWin
            : existingScore.maxStreak
      })
    );
  } else {
    localStorage.setItem(
      "pokedle_score",
      JSON.stringify({
        1: incrementScore(hintsNeeded, 1),
        2: incrementScore(hintsNeeded, 2),
        3: incrementScore(hintsNeeded, 3),
        4: incrementScore(hintsNeeded, 4),
        5: incrementScore(hintsNeeded, 5),
        6: incrementScore(hintsNeeded, 6),
        played: 1,
        winTotal: isAWin,
        winPercentage: isAWin === 0 ? 0 : 100,
        currentStreak: isAWin,
        maxStreak: isAWin
      })
    );
  }
};

const incrementScore = (
  hintsNeeded: number,
  scoreToIncrement: number
): number => {
  return hintsNeeded === scoreToIncrement ? 1 : 0;
};
