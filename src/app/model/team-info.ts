export interface TeamInfo {
  "id": string;
  "number": string;
  "name": string;
  "approved": boolean,
  "club": {
    "name": string;
    "location": {
      "name": string;
    }
  },
  "registrar": {
    "firstName": string;
    "lastName": string;
  }
}
