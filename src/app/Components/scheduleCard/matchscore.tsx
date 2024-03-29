import React, { useState } from "react";
import styles from "./addMatch.module.css";
import Image from "next/image";
import { useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function Match({
  match_id,
  home_team: initialHomeTeam,
  away_team: initialAwayTeam,
  time: initialTime,
  date: initialDate,
  location: initialLocation,
}: {
  match_id: string;
  home_team: string;
  away_team: string;
  time: string;
  date: string;
  location: string;
}) {
  const [editing, setEditing] = useState(false);
  const [home_team, setHomeTeam] = useState(initialHomeTeam);
  const [away_team, setAwayTeam] = useState(initialAwayTeam);
  const [time, setTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);
  const [location, setLocation] = useState(initialLocation);
  const [teams, setTeams] = useState<string[]>([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [scoresSubmitted, setScoresSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        setTeams(data.uniqueTeams);
        setHomeTeam(initialHomeTeam);
      });

    fetch("/api/matchSchedule")
      .then((res) => res.json())
      .then((data) => {
        const matchRows = data.result.rows;
        matchRows.forEach(
          (row: {
            match_id: string;
            home_team: string;
            away_team: string;
            home_score: number;
            away_score: number;
          }) => {
            if (row.match_id === match_id) {
              setHomeScore(row.home_score);
              setAwayScore(row.away_score);
            }
          }
        );
      });
  }, [
    initialHomeTeam,
    initialAwayTeam,
    initialTime,
    initialDate,
    initialLocation,
    match_id,
  ]);

  const handleEdit = () => {
    setEditing(true);
  };
  const handleSubmit = () => {
    const confirmation = window.confirm(
      `Are you sure you want to submit the score for match ${match_id} ? \n ${home_team} ${homeScore} - ${awayScore} ${away_team} \n This action cannot be undone.`
    );
    if (!confirmation) {
      return;
    }
    fetch("/api/submitScore", {
      method: "POST",
      body: JSON.stringify({
        match_id,
        away_team,
        home_team,
        homeScore,
        awayScore,
      }),
    })
      .then(() => setScoresSubmitted(true))
      .catch((error) => console.error("Error submitting scores:", error));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/editMatch", {
        method: "POST",
        body: JSON.stringify({
          match_id,
          home_team,
          away_team,
          time,
          date,
          location,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update match");
      }
      setEditing(false);
    } catch (error) {
      console.error("Error updating match:", error);
    }
    window.location.reload();
  };
  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to Delete Match?"
    );
    if (!confirmation) {
      return;
    }
    try {
      const response = await fetch("/api/deleteMatch", {
        method: "POST",
        body: JSON.stringify({
          match_id,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete match");
      }
    } catch (error) {
      console.error("Error deleting match:", error);
    }
    window.location.reload();
  };

  const handleCancel = () => {
    setHomeTeam(initialHomeTeam);
    setAwayTeam(initialAwayTeam);
    setTime(initialTime);
    setDate(initialDate);
    setLocation(initialLocation);
    setEditing(false);
  };

  const handleHomeScoreIncrement = () => {
    setHomeScore(homeScore + 1);
    fetch("/api/updateScore", {
      method: "POST",
      body: JSON.stringify({
        match_id,
        homeScore: homeScore + 1,
        awayScore,
      }),
    });
  };

  const handleAwayScoreIncrement = () => {
    setAwayScore(awayScore + 1);
    fetch("/api/updateScore", {
      method: "POST",
      body: JSON.stringify({
        match_id,
        homeScore,
        awayScore: awayScore + 1,
      }),
    });
  };
  const handleHomeScoreDecrement = () => {
    if (homeScore > 0) {
      setHomeScore(homeScore - 1);
    }
    fetch("/api/updateScore", {
      method: "POST",
      body: JSON.stringify({
        match_id,
        homeScore: homeScore - 1,
        awayScore,
      }),
    });
  };
  const handleAwayScoreDecrement = () => {
    if (awayScore > 0) {
      setAwayScore(awayScore - 1);
    }
    fetch("/api/updateScore", {
      method: "POST",
      body: JSON.stringify({
        match_id,
        homeScore,
        awayScore: awayScore - 1,
      }),
    });
  };

  return (
    <div className={styles.card}>
      <h2>Match {match_id}</h2>
      <Image
        src={`/logos/${home_team}.jpeg`}
        alt={`Logo of ${home_team}`}
        width={100}
        height={100}
        className={styles.logo}
      />
      <p>
        Home Team:{" "}
        {editing ? (
          <select onChange={(e) => setHomeTeam(e.target.value)}>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        ) : (
          <span className={homeScore > awayScore ? styles.winningTeam : ""}>
            {initialHomeTeam.toUpperCase()}
          </span>
        )}
      </p>
      <p>vs</p>
      <Image
        src={`/logos/${away_team}.jpeg`}
        alt={`Logo of ${away_team}`}
        width={100}
        height={100}
        className={styles.logo}
      />
      <p>
        Away Team:{" "}
        {editing ? (
          <select id="awayteam" onChange={(e) => setAwayTeam(e.target.value)}>
            {teams
              .filter((team) => team !== home_team)
              .map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
          </select>
        ) : (
          <span className={awayScore > homeScore ? styles.winningTeam : ""}>
            {initialAwayTeam.toUpperCase()}
          </span>
        )}
      </p>
      <p>
        Time:{" "}
        {editing ? (
          <input
            type="time"
            onChange={(e) => setTime(e.target.value)}
            value={time}
          />
        ) : (
          time
        )}
      </p>
      <p>
        Date:{" "}
        {editing ? (
          <input
            type="date"
            onChange={(e) => setDate(e.target.value)}
            value={date.substring(0, 10)}
          />
        ) : (
          date.substring(5, 7) +
          "/" +
          date.substring(8, 10) +
          "/" +
          date.substring(0, 4)
        )}
      </p>
      <p>
        Location:{" "}
        {editing ? (
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        ) : (
          location
        )}
      </p>
      {editing ? (
        <>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
          <Button variant="primary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={handleEdit}>
          Edit Match Details
        </Button>
      )}
      <div className={styles.score}>
        <p>Score</p>
        <Button variant="danger" onClick={handleHomeScoreDecrement}>
          -
        </Button>
        <span>
          {home_team.toUpperCase()} :<big> {homeScore}</big>
        </span>
        <Button variant="success" onClick={handleHomeScoreIncrement}>
          +
        </Button>
        <br />
        <br />
        <span>
          <Button variant="danger" onClick={handleAwayScoreDecrement}>
            -
          </Button>
          {away_team.toUpperCase()} : <big>{awayScore}</big>
          <Button variant="success" onClick={handleAwayScoreIncrement}>
            +
          </Button>
        </span>
        <br />
        <br />
        <Button variant="primary" onClick={handleSubmit}>
          {" "}
          Submit Score
        </Button>
      </div> 
       {scoresSubmitted && (
        <Alert variant="success">Scores submitted successfully</Alert>
      )}
    </div>
  );
}
