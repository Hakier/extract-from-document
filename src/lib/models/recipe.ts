import { IMap } from './map';
import { Scope } from './scope';
import { Source } from './source';

export type IRecipe = Source | Scope | IMap | string;
