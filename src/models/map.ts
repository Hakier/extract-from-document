import { Source } from './source';

export interface IMap {
  [key: string]: Source | IMap;
}
