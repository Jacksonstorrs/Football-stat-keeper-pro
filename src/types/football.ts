export type Team = "Home" | "Away";

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

export interface Play {
  id: string;
  type: "Run" | "Pass" | "Penalty" | "Punt" | "Field Goal" | "Kickoff";
  player?: Player;
  yards: number;
  result: string;
  down: number;
  distance: number;
  yardLine: number;
  possession: Team;
  timestamp: number;
}

export interface GameState {
  homeScore: number;
  awayScore: number;
  possession: Team;
  down: number;
  distance: number;
  yardLine: number; // 0 to 100, where 0 is Home goal line, 100 is Away goal line
  quarter: number;
  playLog: Play[];
  roster: {
    home: Player[];
    away: Player[];
  };
}