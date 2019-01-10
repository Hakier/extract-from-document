import { logger } from '@hakier/logger';
import { Scope } from '../src/models/scope';
import { Source } from '../src/models/source';
import { extract } from '../src/util/extract';

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

extract(recipe, url).then((result: any) => logger.info(JSON.stringify(result, null, 2)));
