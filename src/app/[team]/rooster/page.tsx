"use client";
import React, { useState, useEffect } from "react";
import Card from "../../Components/Card/Card";
import Image from "next/image";
import styles from "./styles.module.css";
import { sql } from "@vercel/postgres";

interface RoosterProps {
  params: {
    team: string;
  };
}

const validTeams = [
  "emus",
  "mockingbirds",
  "chickens",
  "mosquitoes",
  "grasskickers",
  "hyenas",
];

interface CardProps {
  player_name: string;
  commitment: string;
  position: string;
}

const fetchData = async (
  team: string,
  setRoosterData: any,
  setLoading: any
) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/${team}/rooster`);
    const data = await response.json();
    const rows = data.rows;
    setRoosterData(rows);
  } catch (error) {
    console.error("Error fetching Rooster data:", error);
  } finally {
    setLoading(false);
  }
};

export default function Rooster({ params }: RoosterProps) {
  const [roosterData, setRoosterData] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(params.team, setRoosterData, setLoading);
  }, [params.team]);

  return loading ? (
    <LoadingMessage />
  ) : validTeams.includes(params.team) ? (
    <ValidTeamContent params={params} roosterData={roosterData} />
  ) : (
    <InvalidTeamContent params={params} />
  );
}

const LoadingMessage = () => (
  <main>
    <h1>... Updating Give me a Second..</h1>
  </main>
);

const ValidTeamContent = ({
  params,
  roosterData,
}: {
  params: { team: string };
  roosterData: CardProps[];
}) => (
  <main>
    <h1>ROOSTER FOR {params.team.toUpperCase()}</h1>
    <TeamLogo team={params.team} />
    <br />
    <PlayerCards params={params} roosterData={roosterData} />
  </main>
);

const InvalidTeamContent = ({ params }: { params: { team: string } }) => (
  <main>
    <h1>Invalid Team</h1>
    <p>Sorry 🙃, No Rooster for {params.team.toUpperCase()} </p>
    We will be adding more teams soon.
    <h1>😊</h1>
  </main>
);

const TeamLogo = ({ team }: { team: string }) => (
  <Image
    src={`/logos/${team}.jpeg`}
    alt="Team logo"
    width={100}
    height={100}
    style={{
      display: "flex",
      margin: "auto",
      marginBottom: "-20px",
    }}
  />
);

const PlayerCards = ({
  params,
  roosterData,
}: {
  params: { team: string };
  roosterData: CardProps[];
}) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [commitmentLevel, setCommitmentLevel] = useState("Full time");
  const [position, setPosition] = useState("Goalkeeper");
  const [removePlayerName, setRemovePlayerName] = useState("");

  const handleAddPlayer = async () => {
    try {
      const response = await fetch(`/api/${params.team}/addnewplayer`, {
        method: "POST",
        body: JSON.stringify({
          player_name: newPlayerName,
          commitment: commitmentLevel,
          position: position,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add player");
      }
    } catch (error) {
      console.error(`Error adding player ${newPlayerName}:`, error);
    }
    window.location.reload();
  };

  const handleRemovePlayer = async () => {
    try {
      const response = await fetch(`/api/${params.team}/removeplayer`, {
        method: "POST",
        body: JSON.stringify({ player_name: removePlayerName }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove player");
      }
    } catch (error) {
      console.error(`Error removing player ${removePlayerName}:`, error);
    }
    window.location.reload();
  };

  return (
    <center>
      <div className={styles.cardContainer}>
        {roosterData.map((row) => (
          <Card
            key={row.player_name}
            player_name={row.player_name}
            commitment={row.commitment}
            position={row.position}
            player_team={params.team}
          />
        ))}
      </div>
      <div id="addplayer">
        <label>Player Name :</label>
        <br />
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <br />
        <select
          value={commitmentLevel}
          onChange={(e) => setCommitmentLevel(e.target.value)}
        >
          <option value="Full time">Full Time</option>
          <option value="Part time">Part Time</option>
        </select>
        <br />
        <select value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="Goalkeeper">Goalkeeper</option>
          <option value="Forward">Forward</option>
          <option value="Midfielder">Midfielder</option>
          <option value="Defender">Defender</option>
        </select>
        <br />
        <button
          style={{
            margin: "10px",
            backgroundColor: "green",
            color: "white",
            width: "150px",
            height: "50px",
          }}
          onClick={handleAddPlayer}
        >
          Add Player
        </button>
      </div>
      <div id="removeplayer">
        <select
          value={removePlayerName}
          onChange={(e) => setRemovePlayerName(e.target.value)}
        >
          <option value="">Select Player to Remove</option>
          {roosterData.map((row) => (
            <option key={row.player_name} value={row.player_name}>
              {row.player_name}
            </option>
          ))}
        </select>
        <br />
        <button
          style={{
            margin: "10px",
            backgroundColor: "red",
            color: "white",
            width: "150px",
            height: "50px",
          }}
          onClick={handleRemovePlayer}
        >
          Remove Player
        </button>
      </div>
    </center>
  );
};
