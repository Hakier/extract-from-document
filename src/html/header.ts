import { launch } from 'puppeteer';

import { IMap } from '../models/map';
import { Scope } from '../models/scope';
import { Source } from '../models/source';
import { extractFromDocument } from '../util/extract-from-document';

const headerRecipe = new Source('h1');

export async function extract(recipe: Source | Scope | IMap) {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/header.html`);

  const result = await page.evaluate(extractFromDocument, recipe);

  await browser.close();

  return result;
}

export async function readHeader() {
  return extract(headerRecipe);
}
