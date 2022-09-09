import {Ranking} from './ranking';

export interface Rankings {
  overall: Ranking | null;
  groups: Ranking[];
}
