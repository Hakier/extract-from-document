import { launch } from 'puppeteer';

import { IMap } from '../models/map';
import { Source } from '../models/source';
import { extractSource } from '../util/extract-source';

const headerRecipe = new Source('h1');


export async function extract(recipe: Source | IMap) {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/header.html`);

  const result = await page.evaluate(extractSource, recipe);

  await browser.close();

  return result;
}

export async function readHeader() {
  return extract(headerRecipe);
}
