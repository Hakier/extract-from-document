import { logger } from './util/logger';
import { readHeader } from './html/header';

readHeader().then((result: any) => {
  logger.info(JSON.stringify(result, null, 4));
});
