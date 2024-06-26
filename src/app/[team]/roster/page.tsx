"use client";
import React, { useState, useEffect } from "react";
import Card from "../../Components/Card/Card";
import Image from "next/image";
import styles from "./styles.module.css";
import Button from "react-bootstrap/Button";
import { Toaster, toast } from "sonner"; 
interface RosterProps {
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
  "paceychickens"
];
interface CardProps {
  player_name: string;
  commitment: string;
  position: string;
  previous_club: string;
}

const fetchData = async (team: string, setRosterData: any, setLoading: any) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/${team}/roster`);
    const data = await response.json();
    const rows = data.rows;
    setRosterData(rows);
  } catch (error) {
    console.error("Error fetching Roster data:", error);
  } finally {
    setLoading(false);
  }
};

export default function Roster({ params }: RosterProps) {
  const [rosterData, setRosterData] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showRemovePlayer, setShowRemovePlayer] = useState(false);

  const handleRemovePlayerClick = () => {
    setShowRemovePlayer(true);
    setShowAddPlayer(false);
  };
  useEffect(() => {
    fetchData(params.team, setRosterData, setLoading);
  }, [params.team]);

  return loading ? (
    <LoadingMessage />
  ) : validTeams.includes(params.team) ? (
    <ValidTeamContent
      params={params}
      rosterData={rosterData}
      handleRemovePlayerClick={handleRemovePlayerClick}
      showAddPlayer={showAddPlayer}
      showRemovePlayer={showRemovePlayer}
    />
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
  rosterData,
  handleRemovePlayerClick,
  showAddPlayer,
  showRemovePlayer,
}: {
  params: { team: string };
  rosterData: CardProps[];
  handleRemovePlayerClick: () => void;
  showAddPlayer: boolean;
  showRemovePlayer: boolean;
}) => (
  <main>
    <h1>ROSTER FOR {params.team.toUpperCase()}</h1>
    <li>
      <center>
        <Button href="/api/auth/signout" variant="danger">
          Sign Out
        </Button>
      </center>
    </li>
    <br />
    <TeamLogo team={params.team} />
    <br />
    <PlayerCards params={params} rosterData={rosterData} />
    <br />
    <br />
  </main>
);

const InvalidTeamContent = ({ params }: { params: { team: string } }) => (
  <main>
    <h1>Invalid Team</h1>
    <p>Sorry 🙃, No Roster for {params.team.toUpperCase()} </p>
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
  rosterData,
}: {
  params: { team: string };
  rosterData: CardProps[];
}) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [commitmentLevel, setCommitmentLevel] = useState("");
  const [previous_club, setPreviousClub] = useState("");
  const [position, setPosition] = useState("");
  const [removePlayerName, setRemovePlayerName] = useState("");

  const handleAddPlayer = async () => {
    if (!newPlayerName) {
      alert("Please enter player name");
      return;
    }
    const confirmation = window.confirm(
      "Are you sure you want to add / update this player?"
    );
    if (confirmation) {
      try {
        const response = await fetch(`/api/${params.team}/addnewplayer`, {
          method: "POST",
          body: JSON.stringify({
            player_name: newPlayerName,
            commitment: commitmentLevel,
            position: position,
            previous_club: previous_club,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to add player");
        }
      } catch (error) {
        console.error(`Error adding player ${newPlayerName}:`, error);
      }
      toast.success("Player added successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleRemovePlayer = async () => {
    if (!removePlayerName) {
      alert("Please select player to remove");
      return;
    }
    const confirmation = window.confirm(
      "Are you sure you want to remove this player?"
    );
    if (!confirmation) {
      return;
    }
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
    toast.success("Player removed successfully");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <center>
      <div className={styles.cardContainer}>
        <Toaster richColors closeButton />
        {rosterData.map((row) => (
          <Card
            key={row.player_name}
            player_name={row.player_name}
            commitment={row.commitment}
            position={row.position}
            player_team={params.team}
            previous_club={row.previous_club}
          />
        ))}
      </div>
      <div className={styles.cardContainer}>
        <div className={styles.addPlayer}>
          <h1>Add Player to {params.team}</h1>
          <label>Player Name :</label>
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <br />
          <label>Commitment :</label>
          <select
            value={commitmentLevel}
            onChange={(e) => setCommitmentLevel(e.target.value)}
          >
             <option >Select Commitment Level</option>
            <option value="Full time">Full Time</option>
            <option value="Part time">Part Time</option>
          </select>
          <br />
          <label>Position :</label>
       
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
             <option >Select Position</option>
            <option value="Goalkeeper">Goalkeeper</option>
            <option value="Forward">Forward</option>
            <option value="Midfielder">Midfielder</option>
            <option value="Defender">Defender</option>
          </select>
          <br />
          <label>Previous Club :</label>
          <select
            value={previous_club}
            onChange={(e) => setPreviousClub(e.target.value)}
          >
            <option >Select Previous Club</option>
            <option value="Mosquitoes">Mosquitoes</option>
            <option value="Hyenas">Hyenas</option>
            <option value="Chickens">Chickens</option>
            <option value="Grasskickeers ">Grasskickers</option>
            <option value="Mockingbirds">Mockingbirds</option>
            <option value="Emus">Emus</option>
          </select>
          <br />
          <Button variant="primary" onClick={handleAddPlayer}>
            Add Player
          </Button>
        </div>
        <div className={styles.addPlayer}>
          <h2>Remove Player</h2>
          <select onChange={(e) => setRemovePlayerName(e.target.value)}>
            {rosterData.map((player) => (
              <option key={player.player_name} value={player.player_name}>
                {player.player_name}
              </option>
            ))}
          </select>
          <br />
          <Button variant="danger" onClick={handleRemovePlayer}>
            Remove Player
          </Button>
        </div>
      </div>
    </center>
  );
};
