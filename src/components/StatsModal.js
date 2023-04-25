import React from "react";
import { fetchScoreFromLocalStorage } from "../utils/storageUtils";

const maxDistributionScore = (distribution) => {
  distribution.sort((a, b) => {
    return b - a;
  });
  return distribution[0];
}

const guessNumberDistributionElement = (score) => {
  let guessNumDist = [];
  const maxScore = maxDistributionScore([score["1"], score["2"], score["3"], score["4"], score["5"], score["6"]]);
  for (let i = 1; i <= 6; i++) {
    let iString = i.toString();
    const width = (score[iString] / maxScore) * 100;
    console.log("width of ", i, iString, score[iString], width);
    guessNumDist.push(<div className="stat-distribution" key={"stat-" + i}><p>{i}</p><div className="distribution-bar" style={{ width: width.toString() + "%" }}><p>{score[iString]}</p></div></div>);
  }
  console.log("element", guessNumDist);
  return <ul>{guessNumDist}</ul>;
}

const StatsModal = () => {
  const score = fetchScoreFromLocalStorage();

  return (
    <div className="stats-modal">
      <h3>Statistics</h3>
      <table>
        <thead>
          <tr>
            <th>Rounds played</th>
            <th>Win Percentage</th>
            <th>Win Total</th>
          </tr>
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
        <p>Guess distribution</p>
        {guessNumberDistributionElement(score)}
      </div>

      <table>
        <thead>
          <tr>
            <th>Current Streak</th>
            <th>Max Streak</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{score.currentStreak}</td>
            <td>{score.maxStreak}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsModal;
