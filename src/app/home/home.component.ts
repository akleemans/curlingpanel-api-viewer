import {Component, OnInit} from '@angular/core';
import * as FileSaver from 'file-saver';
import {ApiService} from './api.service';
import {TeamInfo} from './model/team-info';
import {Tournament} from './model/tournament';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public tournaments: Tournament[] = [];
  public selectedTournament?: Tournament;

  public teams?: TeamInfo[];

  public constructor(
    private readonly apiService: ApiService
  ) {
  }

  public ngOnInit(): void {
    this.apiService.getCurrentTournaments()
    .subscribe(tournaments => this.tournaments = tournaments.filter(t => t.locations.includes('Bern')));
  }

  public switchTournament(): void {
    console.log('Tournaments:', this.tournaments);
    this.apiService.getTeamInfo(this.selectedTournament?.id ?? '').subscribe(ti => this.teams = ti);
  }

  public downloadTeams(): void {
    // Prepare data
    const attributes: string[] = ['id', 'name', 'registrar.lastName', 'registrar.firstName',
      'club.name', 'club.location.name', 'approved', 'number'];
    const data: string[] = [];
    data.push(attributes.join(',') + '\n');
    for (const team of this.teams ?? []) {
      const values = attributes.map(a => this.resolve(team, a));
      data.push(values.join(',') + '\n');
    }
    const blob = new Blob(data, {type: 'text/csv'});
    FileSaver.saveAs(blob, 'teams.csv');
  }

  private resolve(obj: any, ns: string): any {
    let undef;
    const nsa = ns.split('.');
    while (obj && nsa[0]) {
      obj = obj[nsa.shift()] || undef;
    }
    return obj;
  }
}
