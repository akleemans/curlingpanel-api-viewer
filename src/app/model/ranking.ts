import {RankingPosition} from './ranking-position';
import {RankingType} from './ranking-type';

export interface Ranking {
  id: string;
  rankingType: RankingType;
  playSystemCode: number;
  modifiedOn: Date | string;
  groupName: string;
  positions: RankingPosition[];
}
