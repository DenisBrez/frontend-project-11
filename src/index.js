import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import ru from './ru.js';
import render from './view.js';
import fetchRSS from './api.js';
import parse from './parser.js';

const app = () => {
  // Model (состояние)
  const state = {
    formState: 'filling', // valid, invalid, sending
    inputValue: '',
    feeds: [],
    posts: [],
    error: null,
    uiState: {
      modalPostId: null,
      viewedPostsId: [],
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalHeader: document.querySelector('.modal-header'),
    modalBody: document.querySelector('.modal-body'),
    modalButtons: document.querySelectorAll('.btn-outline-primary'),
  };

  yup.setLocale({
    string: {
      required: () => ({ key: 'errors.empty' }),
      url: () => ({ key: 'errors.url' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'errors.alreadyOnTheList' }),
    },
  });

  // i18next
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      // Обновление постов
      const updatePosts = (watchedState) => {
        const promises = watchedState.feeds.map((feed) => fetchRSS(feed.link)
          .then((xml) => {
            const addedPostLinks = watchedState.posts.map((post) => post.link);
            const { posts } = parse(xml, feed.link);
            const newPosts = posts.filter((post) => !addedPostLinks.includes(post.link));
            const postsWithId = newPosts.map((post) => ({
              ...post,
              id: uniqueId(),
              feedId: feed.id,
            }));
            watchedState.posts.unshift(...postsWithId);
            return null;
          })
          .catch((error) => {
            console.error(`Ошибка при получении данных из ${feed.id}:`, error);
            return null;
          }));
        return Promise.all(promises)
          .finally(() => setTimeout(updatePosts, 5000, watchedState));
      };

      // View (представление)
      const watchedState = onChange(state, (path) => render(path, state, elements, i18n));

      // Валидация
      const validateURL = (url, existingLinks) => {
        const schema = yup.string()
          .required()
          .url()
          .notOneOf(existingLinks);

        return schema.validate(url)
          .then(() => null)
          .catch((error) => {
            const translationKey = error.message.key || 'unknown';
            return translationKey;
          });
      };

      // Contoller (события)
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.formState = 'filling';
        const formData = new FormData(e.target);
        const url = formData.get('url');
        watchedState.inputValue = url;

        const existingLinks = watchedState.feeds.map((feed) => feed.link);
        validateURL(url, existingLinks)
          .then((error) => {
            if (error) {
              watchedState.error = error;
              watchedState.formState = 'invalid';
              throw new Error(error);
            } else {
              watchedState.error = null;
              return url;
            }
          })
          .then((link) => {
            watchedState.formState = 'sending';
            fetchRSS(link)
              .then((xml) => {
                const { feed, posts } = parse(xml);
                const feedId = uniqueId();
                watchedState.feeds.push({ ...feed, id: feedId, link: url });
                const postsWithId = posts.map((post) => ({ ...post, id: uniqueId(), feedId }));
                watchedState.posts.unshift(...postsWithId);
                watchedState.formState = 'valid';
              })
              .catch((error) => {
                watchedState.error = error.message;
                watchedState.formState = 'invalid';
                throw new Error(watchedState.error);
              });
          });
      });

      elements.posts.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-outline-primary')) {
          e.preventDefault();
          watchedState.uiState.modalPostId = e.target.dataset.id;
          watchedState.uiState.viewedPostsId.push(e.target.dataset.id);
        }
      });

      updatePosts(watchedState);
    });
};

app();
