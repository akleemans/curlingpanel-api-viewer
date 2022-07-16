import {Person} from './person';

export interface RankingPosition {
  rank: number;
  teamId: string;
  teamNumber: string;
  teamName: string;
  rankTitle: string;
  points: number;
  ends: number;
  stones: number;
  gameCount: number;
  players: Person; // TeamPlayer TODO?
}
