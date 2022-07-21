import {Component, OnInit} from '@angular/core';
import * as FileSaver from 'file-saver';
import {forkJoin} from 'rxjs';
import {ApiService} from './api.service';
import {Game} from './model/game';
import {Location} from './model/location';
import {Person} from './model/person';
import {RankingPosition} from './model/ranking-position';
import {TeamInfo} from './model/team-info';
import {Tournament} from './model/tournament';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public locations: Location[] = [{name: 'Bern', id: 'f0318c85-1f6e-4e76-bea3-d24d6a9f6946'}]
  public selectedLocation: Location = this.locations[0];

  public tournaments: Tournament[] = [];
  public selectedTournament?: Tournament;

  public tournamentLoaded = false;
  public tournamentLoading = false;
  public teams?: TeamInfo[];
  public games?: Game[];
  public overallRankingPositions?: RankingPosition[];

  public teamColumns = ['number', 'name', 'approved', 'club', 'registrar'];
  public gameColumns = ['number', 'name', 'startDateTime', 'sheetNumber', 'teamNameA', 'pointsA', 'endsA', 'stonesA', 'teamNameB', 'pointsB', 'endsB', 'stonesB', 'status'];
  public rankingColumns = ['rank', 'teamNumber', 'teamName', 'rankTitle', 'points', 'ends', 'stones', 'gameCount'];

  public constructor(
    private readonly apiService: ApiService
  ) {
  }

  public ngOnInit(): void {
    this.apiService.getTournaments(this.selectedLocation.id).subscribe(t => this.tournaments = t);
  }

  public switchTournament(tournament: Tournament): void {
    this.tournamentLoaded = false;
    this.tournamentLoading = true;
    forkJoin({
      teams: this.apiService.getTeams(tournament.id),
      games: this.apiService.getGames(tournament.id),
      rankings: this.apiService.getRankings(tournament.id)
    }).subscribe(results => {
      this.teams = results.teams.sort((a, b) => +a.number - +b.number);
      this.games = results.games.sort((a, b) => +a.number - +b.number);
      this.overallRankingPositions = results.rankings?.overall.positions.sort((a, b) => +a.rank - +b.rank);
      this.tournamentLoading = false;
      this.tournamentLoaded = true;
    });
  }

  public downloadTeams(): void {
    const attributes: string[] = ['id', 'number', 'name', 'approved', 'club', 'remark', 'comment',
      'registrar.firstName', 'registrar.lastName', 'registrar.email', 'registrar.phone', 'registrar.language',
      'registrar.address', 'registrar.postalCode', 'registrar.city', 'players'];
    const data: string[] = []
    data.push(attributes.join(';') + '\n')
    for (let team of this.teams ?? []) {

      const values = attributes.map(attribute => {
        if (attribute === 'players') {
          return this.getPlayersString(team);
        } else if (attribute === 'approved') {
          return this.getDisplayBoolean(team.approved);
        }
        const value = this.resolve(team, attribute);
        return value !== undefined ? value.toString() : '';
      });
      data.push(values.join(';') + '\n');
    }
    this.download(data, 'teams')
  }

  private getPlayersString(team: TeamInfo): string {
    return team.players.map(p => p.firstName + ' ' + p.lastName).join(' | ')
  }

  public downloadGames(): void {
    const attributes: string[] = this.gameColumns;
    const data: string[] = []
    data.push(attributes.join(';') + '\n')
    for (let team of this.games ?? []) {
      const values = attributes.map(a => this.resolve(team, a));
      data.push(values.join(';') + '\n');
    }
    this.download(data, 'spiele')
  }

  public downloadRankings(): void {
    const attributes: string[] = this.rankingColumns;
    const data: string[] = []
    data.push(attributes.join(';') + '\n')
    for (let team of this.overallRankingPositions ?? []) {
      const values = attributes.map(a => this.resolve(team, a));
      data.push(values.join(';') + '\n');
    }
    this.download(data, 'rangliste')
  }

  public download(data: string[], name: string): void {
    const blob = new Blob(data, {type: 'text/csv'});
    const fileName = this.getNormalizedTournamentName() + '-' + name + '.csv';
    console.log('fileName:', fileName);
    FileSaver.saveAs(blob, fileName);
  }

  private getNormalizedTournamentName(): string {
    const tournamentName = this.selectedTournament?.name ?? '';
    return tournamentName.toLowerCase().replace(' ', '_').replace(' ', '_');
  }

  private resolve(obj: any, ns: string): any {
    let undef;
    let nsa = ns.split('.');
    while (obj && nsa[0]) {
      obj = obj[nsa.shift()!] || undef;
    }
    return obj;
  }

  public getDisplayName(person: Person): string {
    return person.firstName + ' ' + person.lastName;
  }

  public getDisplayBoolean(b: boolean): string {
    return b ? 'Ja' : 'Nein';
  }
}
