const { fetcher } = require('./fetcher');
const nunjucks = require('nunjucks');
const { pathToRegexp } = require('path-to-regexp');

/**
 * NEIS code finder 서비스 모듈
 * @param {string} path - URL 경로
 * @param {object} query - 쿼리 스트링
 */
exports.infoService = async (path, query) => {
  const pathVal = pathToRegexp('/:interface').exec(path);
  const data = await fetcher(query.q)
  .catch(() => [])

  if (!pathVal) {
    nunjucks.configure('info-service/')
    return nunjucks.render('index.html', {
      query: query.q,
      school_infos: data,
      is_all: true
    });
  }

  const [_, interface] = pathVal;
  if (interface === 'api') {
    return data
  }
}