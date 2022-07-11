import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {TeamInfo} from './model/team-info';
import {Tournament} from './model/tournament';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api.curlingpanel.com';

  public constructor(
    private readonly httpClient: HttpClient
  ) {
  }

  public getCurrentTournaments(): Observable<Tournament[]> {
    return this.httpClient.get<Tournament[]>(`${this.baseUrl}/tournaments/current/info`);
  }

  public getTeamInfo(tournamentId: string): Observable<TeamInfo[]> {
    return this.httpClient.get<TeamInfo[]>(`${this.baseUrl}/teams/tournament/${tournamentId}/info`);
  }
}
