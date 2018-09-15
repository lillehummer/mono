import ajax from './ajax'

/**
 * Returns a Promise that immediately resolves.
 * @return {Promise}
 */
const resolvePromise = () => new Promise(function (resolve, reject) { resolve() })

let isWindow = global === window
let w = isWindow ? global : window

let settings = {
  beforeLoading: resolvePromise,
  links: [],
  selector: 'a:not([target=_blank])',
  replaceContent: resolvePromise,
  trackingEvents: () => {}
}

let elements = {}

let state = {
  metaKeyIsPressed: false,
  url: ''
}

/**
 * [description]
 * @param  {} data [description]
 * @return {DOM}      [description]
 */
const parseDOM = data => {
  let parser = new DOMParser()
  return parser.parseFromString(data, 'text/html')
}

/**
 * Adds attributes of the body element to the state object.
 * @param  {object} object  State object.
 * @param  {[type]} body    Body element.
 * @return {object}         State object.
 */
const updateObjectAttributes = (object, body) => {
  let attrs = body.attributes

  for (let i = 0, size = attrs.length; i < size; i++) {
    object.attrs[attrs[i].name] = attrs[i].value
  }

  return object
}

/**
 * [description]
 * @param  {[type]} head [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
const updateHistory = (url, head, body) => {
  let object = updateObjectAttributes({
    head: head.innerHTML.trim(),
    body: body.innerHTML.trim(),
    attrs: {}
  }, body)

  w.history.pushState(object, '', url)
  w.addEventListener('popstate', updateOnPopState)
}

/**
 * [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
const updateBodyAttributes = (data) => {
  Object.keys(data).forEach(key => {
    let value = data[key]
    document.body.setAttribute(key, value)
  })
}

/**
 * [description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
const updateOnPopState = event => {
  settings.beforeLoading(event).then(() => {
    let head = parseDOM(event.state.head)
    let body = parseDOM(event.state.body)

    updateBodyAttributes(event.state.attrs)

    settings.replaceContent(body.body).then(() => {
      document.title = head.head.querySelector('title').innerText

      state.url = w.location.href

      settings.trackingEvents()

      start()
    })
  })
}

/**
 * [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
const update = (url, data) => {
  let dom = parseDOM(data)
  let head = dom.head
  let body = dom.body

  settings.replaceContent(body).then(() => {
    document.title = head.querySelector('title').innerText

    updateHistory(url, head, body)

    settings.trackingEvents()

    w.scrollTo(0, 0)
    start()
  })
}

/**
 * [description]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
const onClick = (element) => {
  if (state.metaKeyIsPressed) return

  let exitSequence = settings.beforeLoading(event)
  let targetResponse = ajax.get(element.href)

  Promise.all([exitSequence, targetResponse])
    .then(values => {
      update(element.href, values[1])
    })
    // TODO: Catch errors here.
    // .catch(values => {

    // })
}

/**
 * [description]
 * @return {[type]} [description]
 */
const replaceHistory = () => {
  let object = updateObjectAttributes({
    head: document.head.innerHTML.trim(),
    body: document.body.innerHTML.trim(),
    attrs: {}
  }, document.body)

  w.history.replaceState(object, '', state.url)
}

/**
 * [description]
 * @return {[type]} [description]
 */
const addKeyboardListeners = () => {
  w.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey) {
      state.metaKeyIsPressed = true
    }
  })

  w.addEventListener('keyup', (event) => {
    if (event.metaKey || event.ctrlKey) {
      state.metaKeyIsPressed = false
    }
  })
}

const addClickListener = element => {
  if (element.getAttribute('data-loader-active') ||
      element.hostname !== w.location.hostname ||
      element.protocol !== w.location.protocol ||
      /#/.test(element.href)) return

  element.addEventListener('click', event => {
    event.preventDefault()
    onClick(event.currentTarget)
  }, false)

  element.setAttribute('data-loader-active', 'true')
}

/**
 *
 */
const updateLinks = () => {
  elements.links = document.querySelectorAll(settings.selector)
  Array.from(elements.links).forEach(addClickListener)
}

/**
 * Start Mono, configure settings, add event listeners.
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
const start = (params = {}) => {
  settings = Object.assign(settings, params)

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  updateLinks()

  addKeyboardListeners()
  replaceHistory()
}

export default {
  start,
  updateLinks,
  onClick
}
