const parse = (xml) => {
  const posts = [];

  const domParser = new DOMParser();
  const doc = domParser.parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('errors.parseError');
  }

  const feed = {
    title: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
  };

  doc.querySelectorAll('item').forEach((item) => {
    posts.push({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    });
  });

  return { feed, posts };
};

export default parse;
