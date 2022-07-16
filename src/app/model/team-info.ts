import {ApprovalStatus} from './approval-status';
import {Person} from './person';

export interface TeamInfo {
  id: string;
  number: string;
  name: string;
  approved: ApprovalStatus,
  // club: string;
  remark: string;
  comment: string;
  club: {
    name: string;
    location: {
      name: string;
    }
  };
  registrar: Person;
  players: Person[];
}
