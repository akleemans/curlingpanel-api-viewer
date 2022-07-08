export interface Tournament {
  "id": string;
  "name": string;
  "playDateTime": string | Date; // format: "2022-09-16T22:00:00+00:00",
  "secondPlayDateTime": null,
  "showInList": number;
  "tournamentType": number;
  "userId": string;
  "startDate": string | Date;
  "endDate": string | Date;
  "registerStatus": number;
  "clubName": string;
  "locations": string;
  "isRemoved": boolean;
  "isCanceled": boolean;
  "winners": unknown;
}
