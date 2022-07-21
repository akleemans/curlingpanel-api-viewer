import {Person} from './person';

export interface Player {
  position: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface TeamInfo {
  id: string;
  number: string;
  name: string;
  approved: boolean;
  club: string;
  remark: string | null;
  comment: string | null;
  registrar: Person;
  players: Player[];
}
