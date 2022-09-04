import {GameStatus} from './game-status';

export interface Game {
  id: string;
  number: string;
  startDateTime: string; // or string from API
  sheetNumber: string;
  teamNameA: string;
  pointsA?: number;
  endsA?: number;
  stonesA?: number;
  teamNameB: string;
  pointsB?: number;
  endsB?: number;
  stonesB?: number;
  status: GameStatus;
}
