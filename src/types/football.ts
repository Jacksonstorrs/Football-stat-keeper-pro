export type Team = "Home" | "Away";

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

export interface PlayerStats {
  passYds: number;
  passTDs: number;
  ints: number;
  rushYds: number;
  rushTDs: number;
  receptions: number;
  recYds: number;
  tackles: number;
}

export interface Play {
  id: string;
  type: "Run" | "Pass" | "Penalty" | "Punt" | "Field Goal" | "Kickoff" | "Sack" | "Incomplete";
  player?: Player;
  target?: Player; // For passes
  yards: number;
  result: string;
  down: number;
  distance: number;
  yardLine: number;
  possession: Team;
  timestamp: number;
  isFirstDown: boolean;
  isScoringPlay: boolean;
}

export interface Drive {
  id: string;
  possession: Team;
  plays: Play[];
  result: "Touchdown" | "Field Goal" | "Punt" | "Turnover" | "End of Half" | "Active";
  startYardLine: number;
  endYardLine: number;
}

export interface GameState {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeTimeouts: number;
  awayTimeouts: number;
  possession: Team;
  down: number;
  distance: number;
  yardLine: number;
  quarter: number;
  drives: Drive[];
  roster: {
    home: Player[];
    away: Player[];
  };
  stats: Record<string, PlayerStats>; // Keyed by player ID
}