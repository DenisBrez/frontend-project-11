// Отрисовка состояния поля ввода
const renderInput = (state, elements, i18n) => {
  switch (state.formState) {
    case 'filling':
      elements.submit.disabled = false
      elements.input.classList.remove('is-invalid')
      elements.feedback.textContent = ''
      elements.feedback.classList.remove('text-danger')
      elements.feedback.classList.remove('text-success')
      break
    case 'valid':
      elements.submit.disabled = false
      elements.input.classList.remove('is-invalid')
      elements.feedback.classList.remove('text-danger')
      elements.feedback.classList.add('text-success')
      elements.feedback.textContent = i18n.t('status.success')
      break
    case 'invalid':
      elements.submit.disabled = false
      elements.input.classList.add('is-invalid')
      elements.feedback.textContent = i18n.t(state.error)
      elements.feedback.classList.remove('text-success')
      elements.feedback.classList.add('text-danger')
      break
    case 'sending':
      elements.submit.disabled = true
      elements.input.value = ''
      elements.input.classList.remove('is-invalid')
      elements.feedback.textContent = ''
      elements.feedback.classList.remove('text-danger')
      elements.feedback.classList.remove('text-success')
      break
    default:
      break
  }
}

// Отрисовка фидов
const renderFeeds = (state, elements, i18n) => {
  elements.feeds.innerHTML = ''
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const cardTitle = document.createElement('h2')
  cardTitle.classList.add('card-title', 'h4')
  cardTitle.textContent = i18n.t('elements.feeds')

  elements.feeds.append(card)
  card.append(cardBody)
  cardBody.append(cardTitle)

  state.feeds.forEach(({ title, description }) => {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'border-0', 'rounded-0')
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')
    const h3 = document.createElement('h3')
    h3.classList.add('h6', 'm-0')
    h3.textContent = title
    const p = document.createElement('p')
    p.classList.add('m-0', 'small', 'text-black-50')
    p.textContent = description

    card.append(ul)
    ul.append(li)
    li.append(h3)
    li.append(p)
  })
}

// Отрисовка постов
const renderPosts = (state, elements, i18n) => {
  elements.posts.innerHTML = ''
  const card = document.createElement('div')
  card.classList.add('card', 'border-0')
  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')
  const cardTitle = document.createElement('h2')
  cardTitle.classList.add('card-title', 'h4')
  cardTitle.textContent = i18n.t('elements.posts')

  elements.posts.append(card)
  card.append(cardBody)
  cardBody.append(cardTitle)

  state.posts.forEach(({ title, link, id }) => {
    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'border-0', 'rounded-0')
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
    const a = document.createElement('a')
    a.setAttribute('href', link)
    a.setAttribute('data-id', id)
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.textContent = title

    if (state.uiState.viewedPostsId.includes(id)) {
      a.classList.add('fw-normal')
    }
    else {
      a.classList.add('fw-bold')
    }

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('data-id', id)
    button.setAttribute('data-bs-toggle', 'modal')
    button.setAttribute('data-bs-target', '#modal')
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.textContent = i18n.t('elements.button')

    card.append(ul)
    ul.append(li)
    li.append(a)
    li.append(button)
  })
}

// Отрисовка модального окна
const renderModal = (state, elements) => {
  elements.modalHeader.innerHTML = ''
  elements.modalBody.innerHTML = ''

  const activePost = state.posts.filter(post => post.id === state.uiState.modalPostId)
  const [{ description, title }] = activePost

  const h5 = document.createElement('h5')
  h5.classList.add('modal-title')
  h5.textContent = title
  const closeButton = document.createElement('button')
  closeButton.classList.add('btn-close', 'close')
  closeButton.setAttribute('type', 'button')
  closeButton.setAttribute('data-bs-dismiss', 'modal')
  closeButton.setAttribute('aria-label', 'Close')
  elements.modalBody.textContent = description

  elements.modalHeader.append(h5)
  elements.modalHeader.append(closeButton)
}

export default (path, state, elements, i18n) => {
  switch (path) {
    case 'formState':
      renderInput(state, elements, i18n)
      break
    case 'feeds':
      renderFeeds(state, elements, i18n)
      break
    case 'posts':
      renderPosts(state, elements, i18n)
      break
    case 'uiState.modalPostId':
      renderModal(state, elements)
      break
    case 'uiState.viewedPostsId':
      renderPosts(state, elements, i18n)
      break
    default:
      break
  }
}
