import 'bootstrap'
import * as yup from 'yup'
import onChange from 'on-change'
import i18next from 'i18next'
import uniqueId from 'lodash/uniqueId.js'
import ru from './ru.js'
import render from './view.js'
import fetchRSS from './api.js'
import parse from './parser.js'

// Обновление постов
const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map(feed =>
    fetchRSS(feed.link)
      .then((xml) => {
        const existingLinks = watchedState.posts.map(post => post.link)
        const { posts } = parse(xml, feed.link)
        const newPosts = posts.filter(post => !existingLinks.includes(post.link))

        const postsWithId = newPosts.map(post => ({
          ...post,
          id: post.title,
          feedId: feed.id,
        }))

        watchedState.posts.unshift(...postsWithId)
      })
      .catch((error) => {
        console.error(`Ошибка при получении данных из ${feed.link}:`, error)
      }),
  )

  Promise.all(promises)
    .finally(() => setTimeout(() => updatePosts(watchedState), 5000))
}

// Валидация URL
const validateURL = (url, state) => {
  const existingLinks = state.feeds.map(feed => feed.link)
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(existingLinks)

  return schema.validate(url)
    .then(() => null)
    .catch(error => error.message.key || 'unknown')
}

const app = () => {
  const state = {
    form: {
      status: 'filling', // 'valid', 'invalid'
      error: null,
    },
    loading: {
      status: 'idle', // 'idle', 'sending', 'success', 'error'
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      modalPostId: null,
      viewedPostsId: [],
    },
  }

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
  }

  yup.setLocale({
    string: {
      required: () => ({ key: 'errors.empty' }),
      url: () => ({ key: 'errors.url' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'errors.alreadyOnTheList' }),
    },
  })

  const i18n = i18next.createInstance()

  i18n.init({
    lng: 'ru',
    debug: true,
    resources: { ru },
  }).then(() => {
    const watchedState = onChange(state, path => render(path, state, elements, i18n))

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault()
      watchedState.form.status = 'filling'

      const formData = new FormData(e.target)
      const url = formData.get('url').trim()

      validateURL(url, watchedState)
        .then((validationError) => {
          if (validationError) {
            watchedState.form.status = 'invalid'
            watchedState.form.error = validationError
            throw new Error(validationError)
          }

          watchedState.form.status = 'valid'
          watchedState.form.error = null
          watchedState.loading.status = 'sending'
          watchedState.loading.error = null

          return fetchRSS(url)
        })
        .then((xml) => {
          const { feed, posts } = parse(xml)
          const feedId = uniqueId()
          watchedState.feeds.push({ ...feed, id: feedId, link: url })

          const postsWithId = posts.map(post => ({
            ...post,
            id: post.title,
            feedId,
          }))

          watchedState.posts.unshift(...postsWithId)
          watchedState.loading.status = 'success'
        })
        .catch((error) => {
          watchedState.loading.status = 'error'
          watchedState.loading.error = error.message
          watchedState.form.status = 'invalid'
          watchedState.form.error = 'errors.network'
        })
    })

    elements.posts.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-outline-primary')) {
        e.preventDefault()
        const postId = e.target.dataset.id
        watchedState.uiState.modalPostId = postId

        if (!watchedState.uiState.viewedPostsId.includes(postId)) {
          watchedState.uiState.viewedPostsId.push(postId)
        }
      }
    })

    updatePosts(watchedState)
  })
}

export default app
