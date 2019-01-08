import { logger } from '@hakier/logger';
import { launch } from 'puppeteer';
import { selectors } from './aliExpress/selectors';
import { IRecipe } from './models/recipe';
import { Scope } from './models/scope';
import { Source } from './models/source';
import { extractFromDocument } from './util/extract-from-document';

const recipe = {
  overlay: new Source(selectors.common.overlay.close),
};
const url = 'https://www.aliexpress.com/';

async function extract() {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  try {
    await page.click(selectors.common.overlay.close);
    console.log('element appeared');
  } catch (error) {
    console.log('The element didn\'t appear.');
  }

  const needToLogin = await page.evaluate(extractFromDocument, new Source(selectors.main.signIn));
  console.log(`>>> needToLogin`, needToLogin);
  const result = await page.evaluate(extractFromDocument, recipe);

  // await browser.close();

  return result;
}

extract().then((result: any) => logger.info(JSON.stringify(result, null, 2)));
