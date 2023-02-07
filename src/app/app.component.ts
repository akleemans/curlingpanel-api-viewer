import {Component, OnInit} from '@angular/core';

import {addYears, getMonth, getYear, isAfter, isBefore} from 'date-fns';
import * as FileSaver from 'file-saver';
import {forkJoin} from 'rxjs';
import * as XLSX from 'xlsx';
import {ApiService} from './api.service';
import {Game} from './model/game';
import {Location} from './model/location';
import {Person} from './model/person';
import {RankingPosition} from './model/ranking-position';
import {TeamInfo} from './model/team-info';
import {Tournament} from './model/tournament';

interface Season {
  name: string;
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public locations: Location[] = [{name: 'Bern', id: 'f0318c85-1f6e-4e76-bea3-d24d6a9f6946'}]
  public selectedLocation: Location = this.locations[0];

  public tournaments: Tournament[] = [];
  public filteredTournaments: Tournament[] = [];
  public selectedTournament?: Tournament;

  public seasons: Season[] = [];
  public selectedSeason?: Season;

  public tournamentLoaded = false;
  public tournamentLoading = false;
  public teams?: TeamInfo[];
  public games?: Game[];
  public overallRankingPositions?: RankingPosition[];

  public teamColumns = ['number', 'name', 'approved', 'club', 'registrar'];
  public gameColumns = ['number', 'name', 'startDateTime', 'sheetNumber', 'teamNameA', 'pointsA', 'endsA', 'stonesA', 'teamNameB', 'pointsB', 'endsB', 'stonesB', 'status'];
  public rankingColumns = ['rank', 'teamNumber', 'teamName', 'rankTitle', 'points', 'ends', 'stones', 'gameCount'];

  public teamColWidths = [
    // id to Kommmentar
    {wch: 10}, {wch: 10}, {wch: 25}, {wch: 10}, {wch: 25}, {wch: 80}, {wch: 20},
    {wch: 15}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 10}, {wch: 20}, {wch: 10}, {wch: 15}, {wch: 100},
  ];

  private readonly CSV_DELIMITER = ';'
  private readonly EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

  public constructor(
    private readonly apiService: ApiService
  ) {
  }

  public ngOnInit(): void {
    this.apiService.getTournaments(this.selectedLocation.id).subscribe(t => {
      this.tournaments = t.sort((a, b) => isAfter(a.startDate, b.startDate) ? -1 : 1);
      console.log('Got tournaments:', this.tournaments);
      this.seasons = this.getSeasons(this.tournaments);
      this.selectedSeason = this.seasons[0];
      this.switchSeason(this.selectedSeason);
    });
  }

  private getSeasons(tournaments: Tournament[]): Season[] {
    const seasons: Season[] = [];
    tournaments.forEach(t => {
      const monthSwitch = getMonth(t.startDate) >= 8 ? 0 : -1;
      const year = getYear(t.startDate) + monthSwitch;

      const seasonString = `Saison ${year}/${year + 1}`;
      if (!seasons.find(s => s.name === seasonString)) {
        const startDate = new Date(year, 8, 1);
        seasons.push({
          name: seasonString,
          startDate,
          endDate: addYears(startDate, 1)
        })
      }
    });
    return seasons;
  }

  public switchSeason(season: Season): void {
    this.filteredTournaments = this.tournaments.filter(t => this.isInSeason(t, season))
    .sort((a, b) => a.name < b.name ? -1 : 1);
  }

  private isInSeason(tournament: Tournament, season: Season | undefined): boolean {
    if (!season) {
      return false;
    }
    return isAfter(tournament.startDate, season.startDate) && isBefore(tournament.startDate, season.endDate);
  }

  public switchTournament(tournament: Tournament): void {
    this.tournamentLoaded = false;
    this.tournamentLoading = true;
    forkJoin({
      teams: this.apiService.getTeams(tournament.id),
      games: this.apiService.getGames(tournament.id),
      rankings: this.apiService.getRankings(tournament.id)
    }).subscribe(results => {
      console.log('results:', results);
      this.teams = (results.teams ?? []).sort((a, b) => +a.number - +b.number);
      this.games = results.games.sort((a, b) => +a.number - +b.number);
      this.overallRankingPositions = results.rankings?.overall?.positions.sort((a, b) => +a.rank - +b.rank);
      this.tournamentLoading = false;
      this.tournamentLoaded = true;
    });
  }

  public prepareTeamsData(): string[][] {
    const attributes: string[] = ['id', 'number', 'name', 'approved', 'club', 'remark', 'comment',
      'registrar.firstName', 'registrar.lastName', 'registrar.language', 'registrar.postalCode',
      'registrar.city', 'players'];
    const displayAttributes: string[] = ['id', 'Nummer', 'Name', 'Bestätigt', 'Klub', 'Bemerkung',
      'Kommentar', 'Vorname', 'Nachname', 'Sprache', 'PLZ', 'Stadt', 'Spieler'];
    const data: string[][] = [];
    data.push(displayAttributes);
    for (let team of this.teams ?? []) {
      const values = attributes.map(attribute => {
        if (attribute === 'players') {
          return this.getPlayersString(team);
        } else if (attribute === 'approved') {
          return this.getDisplayBoolean(team.approved);
        }
        const value = this.resolve(team, attribute);
        return value !== undefined ? value.toString() : '';
      }).map(v => this.replaceSpecialChars(v));
      data.push(values);
    }
    return data;
  }

  public prepareGamesData(): string[][] {
    const attributes: string[] = this.gameColumns;
    const data: string[][] = [];
    data.push(attributes)
    for (let team of this.games ?? []) {
      const values = attributes.map(a => this.resolve(team, a)).map(v => this.replaceSpecialChars(v));
      data.push(values);
    }
    return data;
  }

  public prepareRankingsData(): string[][] {
    const attributes: string[] = this.rankingColumns;
    const data: string[][] = [];
    data.push(attributes)
    for (let team of this.overallRankingPositions ?? []) {
      const values = attributes.map(a => this.resolve(team, a)).map(v => this.replaceSpecialChars(v));
      data.push(values);
    }
    return data;
  }

  public downloadTeamsCSV(): void {
    const data = this.prepareTeamsData();
    this.downloadCSV(data.map(row => row.join(this.CSV_DELIMITER) + '\n'), 'teams')
  }

  public downloadGamesCSV(): void {
    const data = this.prepareGamesData();
    this.downloadCSV(data.map(row => row.join(this.CSV_DELIMITER) + '\n'), 'spiele')
  }

  public downloadRankingsCSV(): void {
    const data = this.prepareRankingsData();
    this.downloadCSV(data.map(row => row.join(this.CSV_DELIMITER) + '\n'), 'rangliste')
  }

  public downloadTeamsXSLX(): void {
    const data = this.prepareTeamsData();
    this.downloadXLSX(data, 'teams', this.teamColWidths);
  }

  public downloadGamesXSLX(): void {
    const data = this.prepareGamesData();
    this.downloadXLSX(data, 'spiele', []);
  }

  public downloadRankingsXSLX(): void {
    const data = this.prepareRankingsData();
    this.downloadXLSX(data, 'rangliste', []);
  }

  private replaceSpecialChars(value: string): string {
    value = (value == null ? '' : value.toString());
    return value.split(this.CSV_DELIMITER).join(',').split('\n').join(' | ');
  }

  private getPlayersString(team: TeamInfo): string {
    return team.players.map(p => {
      let name = (p.firstName ?? '') + ' ' + (p.lastName ?? '');
      if (p.role) {
        name += ' (' + p.role + ')';
      }
      return name;
    }).filter(n => n.trim().length > 0).join(' | ')
  }

  public downloadCSV(data: string[], name: string): void {
    const blob = new Blob(data, {type: 'text/csv'});
    const fileName = this.getNormalizedTournamentName() + '-' + name + '.csv';
    FileSaver.saveAs(blob, fileName);
  }

  public downloadXLSX(json: string[][], name: string, colWidths: any[]): void {
    const fileName = this.getNormalizedTournamentName() + '-' + name + '.xlsx';

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, {skipHeader: true});
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};

    // Set column width
    worksheet["!cols"] = colWidths;

    // Set autofilter
    worksheet['!autofilter'] = {ref: "A1:P1"};

    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});

    const data: Blob = new Blob([excelBuffer], {type: this.EXCEL_TYPE});
    FileSaver.saveAs(data, fileName);
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
    if (!person) {
      return '-';
    }
    return person.firstName + ' ' + person.lastName;
  }

  public getDisplayBoolean(b: boolean): string {
    return b ? 'Ja' : 'Nein';
  }
}
