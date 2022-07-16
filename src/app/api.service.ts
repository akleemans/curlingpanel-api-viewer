import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Game} from './model/game';
import {Rankings} from './model/rankings';
import {TeamInfo} from './model/team-info';
import {Tournament} from './model/tournament';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Development URL
  // private baseUrl = 'http://localhost:5000/api/curlingpanel-api';
  private baseUrl = 'https://akleemans.pythonanywhere.com/api/curlingpanel-api';

  public constructor(
    private readonly httpClient: HttpClient
  ) {
  }

  public getTournaments(locationId: string): Observable<Tournament[]> {
    return this.httpClient.get<Tournament[]>(`${this.baseUrl}?type=tournaments&id=${locationId}`);
  }

  public getTeams(tournamentId: string): Observable<TeamInfo[]> {
    return this.httpClient.get<TeamInfo[]>(`${this.baseUrl}?type=teams&id=${tournamentId}`);
  }

  public getGames(tournamentId: string): Observable<Game[]> {
    return this.httpClient.get<Game[]>(`${this.baseUrl}?type=games&id=${tournamentId}`);
  }

  public getRankings(tournamentId: string): Observable<Rankings> {
    return this.httpClient.get<Rankings>(`${this.baseUrl}?type=rankings&id=${tournamentId}`);
  }
}
