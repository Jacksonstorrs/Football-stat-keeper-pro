export type Team = "Home" | "Away";

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

export interface PlayerStats {
  passAtt: number;
  passComp: number;
  passYds: number;
  passTDs: number;
  ints: number;
  rushAtt: number;
  rushYds: number;
  rushTDs: number;
  receptions: number;
  recYds: number;
  recTDs: number;
  fumbles: number;
  tackles: number;
  sacks: number;
}

export type PlayType = 
  | "Run" 
  | "Pass" 
  | "Incomplete" 
  | "Sack" 
  | "Penalty" 
  | "Punt" 
  | "Field Goal" 
  | "Kickoff" 
  | "Touchdown" 
  | "Turnover"
  | "Fumble";

export interface Play {
  id: string;
  type: PlayType;
  player?: Player;
  yards: number;
  result: string;
  down: number;
  distance: number;
  yardLine: number;
  possession: Team;
  timestamp: number;
  isFirstDown: boolean;
  isScoringPlay: boolean;
  driveId: string;
}

export interface Drive {
  id: string;
  team: Team;
  startYardLine: number;
  endYardLine?: number;
  plays: number;
  yards: number;
  result?: string;
  startTime: number;
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
  gameClock: number; // seconds
  isClockRunning: boolean;
  currentDriveId: string;
  playLog: Play[];
  drives: Drive[];
  roster: {
    home: Player[];
    away: Player[];
  };
  stats: Record<string, PlayerStats>;
}