import { IMap } from './map';

export class Scope {
  constructor(public map: IMap, public selector: string, public isSingle: boolean = true) {}
}
