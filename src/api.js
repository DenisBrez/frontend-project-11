import axios from 'axios';

const getProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const fetchRSS = (url) => {
  const proxyUrl = getProxyUrl(url);

  return axios.get(proxyUrl)
    .then((responce) => {
      if (responce.status !== 200) {
        throw new Error('errors.network');
      }
      return responce.data.contents;
    })
    .catch(() => {
      throw new Error('errors.network');
    });
};

export default fetchRSS;
