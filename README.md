# extract-from-document

This is a utility function that simplifies data extraction from document 

## Installing

Via npm:

```bash
$ npm install [-g] extract-from-document
```

## Usage

To use this function you should get an instance of document or element (`IScope`) eg. when you are inside a browser and a recipe (`IRecipe`) which will configure what you want to extract from a document.
A recipe can be a `Source`, `Scope` or `IMap`.

`Source` is a simplest one - it has element selector, optional attribute name (default: 'innerText') and optional isSingle flag (default: true).
```typescript
export class Source {
  constructor(public selector: string, public attribute: string = 'innerText', public isSingle: boolean = true) {}
}
```

`IMap` is an object with key-value pair where the key is a `string` and value is an `IRecipe`
```typescript
export interface IMap {
  [key: string]: IRecipe;
}
```

`Scope` is a map (`IMap`) with a selector (specify a context). It is useful eg. when you want to extract data from a specific table or row.
```typescript
export class Scope {
  constructor(public map: IMap, public selector: string, public isSingle: boolean = true) {}
}
```

Example usage is shown below with a function `getDocument()` that you must implement or replace that will return a document or HTML element.
```typescript
import { extractFromDocument, IRecipe, Source } from 'extract-from-document';

const document: HTMLElement | Document = getDocument() // obtain somehow document instance
const recipe: IRecipe = new Source('.some-class-selector');
const result = extractFromDocument(recipe, document); 
``` 

## Example usage with puppeter

I will show you how you can use it with a puppeter.

Implement a helper function called `extract` which will be inside `./util/extract.ts` file. It will launch a browser, open page and pass extractFromDocument with a provided recipe to evaluate function which will extract data from a given url.

```typescript
import { launch } from 'puppeteer';

import { extractFromDocument, IRecipe } from 'extract-from-document';

export async function extract(recipe: IRecipe, url: string) {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(extractFromDocument, recipe);

  await browser.close();

  return result;
}
```

Now we import this `extract` function and specify a `recipe` what we want to extract and a `url` to inform from where we want to do it. We are logging stringified result to a console.
```typescript
import { Scope, Source } from 'extract-from-document';
import { extract } from './util/extract';

const recipe = {
  hotNetworkQuestions: new Scope({
    title: new Source('a'),
    url: new Source('a', 'href'),
  }, '#hot-network-questions li', false),
  related: new Scope({
    answer: {
      url: new Source('a[title^="Vote score"]', 'href'),
      votes: new Source('.answer-votes'),
    },
    title: new Source('.question-hyperlink'),
    url: new Source('.question-hyperlink', 'href'),
  }, '.module.sidebar-related .spacer', false),
};
const url = 'https://stackoverflow.com/questions/24825860/code-coverage-for-jest';

extract(recipe, url).then((result: any) => console.info(JSON.stringify(result, null, 2)));
```
