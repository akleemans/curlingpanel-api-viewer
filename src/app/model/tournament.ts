import {TournamentType} from './tournament-type';

// date format: 2022-09-16T22:00:00+00:00,

export interface Tournament {
  id: string;
  name: string;
  // playDateTime: string | Date;
  // secondPlayDateTime: null,
  showInList: number;
  tournamentType: TournamentType;
  // userId: string;
  startDate: Date; // string | Date
  endDate: string | Date;
  // registerStatus: number;
  clubName: string;
  // locations: string;
  // isRemoved: boolean;
  isCanceled: boolean;
  // winners: unknown;
}

/*
DateTime? StartDate { get; set; } // Turnierbeginn
DateTime? EndDate { get; set; }
 */
