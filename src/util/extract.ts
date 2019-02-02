import { launch } from 'puppeteer';

import { IRecipe } from '../models';
import { extractFromDocument } from './extract-from-document';

export async function extract(recipe: IRecipe, url: string) {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(extractFromDocument, recipe);

  await browser.close();

  return result;
}
