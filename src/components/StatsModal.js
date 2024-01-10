import React from "react";
import { fetchScoreFromLocalStorage } from "../utils/storageUtils";
import { DistributionBar, TitleTableRow } from "../styles";

export const maxDistributionScore = (distribution) => {
  distribution.sort((a, b) => {
    return b - a;
  });
  return distribution[0];
}

const StatDistribution = (score, i, iString) => {
  return (
    <div className="stat-distribution" key={"stat-" + i}>
      <p className="stat-distribution-label">{i}</p>
      <div className="distribution-bar-container">
        <DistributionBar className="distribution-bar">
          <p>{score[iString]}</p>
        </DistributionBar>
      </div>
    </div>
  );
}

const guessNumberDistributionElement = (score) => {
  let guessNumDist = [];
  for (let i = 1; i <= 6; i++) {
    let iString = i.toString();
    guessNumDist.push(StatDistribution(score, i, iString));
  }
  return <ul>{guessNumDist}</ul>;
}

const StatsModal = () => {
  const score = fetchScoreFromLocalStorage();

  return (
    <div className="stats-modal">
      <h3>Statistics - Daily Mode</h3>
      <table>
        <thead>
          <TitleTableRow>
            <th>Rounds played</th>
            <th>Win Percentage</th>
            <th>Win Total</th>
          </TitleTableRow>
        </thead>
        <tbody>
          <tr>
            <td>{score.played}</td>
            <td>{score.winPercentage}%</td>
            <td>{score.winTotal}</td>
          </tr>
        </tbody>
      </table>

      <div className="stats-distribution">
        {guessNumberDistributionElement(score)}
      </div>

      <table>
        <thead>
          <TitleTableRow>
            <th>Current Streak</th>
            <th>Max Streak</th>
          </TitleTableRow>
        </thead>
        <tbody>
          <tr>
            <td>{score.currentStreak}</td>
            <td>{score.maxStreak}</td>
          </tr>
        </tbody>
      </table>

      <br />
      <br />

      <h3>Statistics - Endless Mode</h3>
      <table>
        <thead>
          <TitleTableRow>
            <th>Current Streak</th>
            <th>Max Streak</th>
          </TitleTableRow>
        </thead>
        <tbody>
          <tr>
            <td>{score.endlessCurrentStreak}</td>
            <td>{score.endlessMaxStreak}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsModal;
