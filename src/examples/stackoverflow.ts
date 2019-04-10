import { Scope, Source } from '../lib';
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

// tslint:disable-next-line:no-console
extract(recipe, url).then((result: any) => console.info(JSON.stringify(result, null, 2)));
