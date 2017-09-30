import ajax from './ajax'

//   {
//     this.url = doc.location.href;
//     this.beforeLoading = new global.Promise(function(resolve, reject) { resolve() });
//     this.updateContent = new Promise(function(resolve, reject) { resolve() });
//     this.metaKeyIsPressed = false;
//   }

const mono = () => {
  var isWindow = global === window
  var w = isWindow ? global : window
  var doc = document

  /**
   * [description]
   * @param  {[type]} obj  [description]
   * @param  {[type]} body [description]
   * @return {[type]}      [description]
   */
  const updateObject = (obj, body) => {
    var attrs = body.attributes;

    for (var i = 0, size = attrs.length; i < size; i++) {
      obj.attrs[attrs[i].name] = attrs[i].value
    }

    return obj
  }

  /**
   * [description]
   * @param  {[type]} head [description]
   * @param  {[type]} body [description]
   * @return {[type]}      [description]
   */
  const updateHistory = (head, body) => {
    var obj = this._updateObject({
      head: head.innerHTML.trim(),
      content: body.innerHTML.trim(),
      attrs: {}
    }, body)

    w.history.pushState(obj, '', this.url)
    w.addEventListener('popstate', this._updateBody.bind(this), false)
  }

  /**
   * [description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  const DOMParser = (data) => {
    var parser = new DOMParser()
    return parser.parseFromString(data, 'text/html')
  }

  /**
   * [description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  const updateBodyAttributes = (data) => {
    Object.keys(data).forEach(function(key) {
      var value = data[key]
      doc.body.setAttribute(key, value)
    })
  }

  /**
   * [description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  const updateBody = (e) => {
    this.beforeLoading().then(() => {
      var data = e.state
      this._updateBodyAttributes(data.attrs)
      var dom = this._DOMParser(data.head)
      var content = this._DOMParser(data.content)

      this.updateContent(content.body).then(() => {
        doc.title = dom.head.querySelector('title').innerText

        this.url = w.location.href
        this.start()
      })
    })
  }

  /**
   * [description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  const update = (data) => {
    var dom = this._DOMParser(data)
    var head = dom.head
    var body = dom.body

    this.updateContent(body).then(() => {
      doc.title = head.querySelector('title').innerText

      this._updateHistory(head, body)
      w.scrollTo(0, 0)
      this.start()
    })
  }

  /**
   * [description]
   * @param  {[type]} element [description]
   * @return {[type]}         [description]
   */
  const onClick = (element) => {
    this.beforeLoading().then(() => {
      this.url = element.href
      M.ajax.get(this.url)
        .then(this._update.bind(this))
        .catch(this._update.bind(this))
    })
  }

  /**
   * [description]
   * @return {[type]} [description]
   */
  const replaceHistory = () => {
    var body = doc.body
    var obj = this._updateObject({
      head: doc.head.innerHTML.trim(),
      content: body.innerHTML.trim(),
      attrs: {}
    }, body)

    w.history.replaceState(obj, '', this.url)
  }

  /**
   * [description]
   * @return {[type]} [description]
   */
  const events = () => {
    var that = this

    w.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey) {
        that.metaKeyIsPressed = true
      }
    })

    w.addEventListener('keyup', (e) => {
      if (e.metaKey || e.ctrlKey) {
        that.metaKeyIsPressed = false
      }
    })
  }

  /**
   * [description]
   * @param  {[type]} resolve [description]
   * @param  {[type]} reject) {            resolve() } [description]
   * @return {[type]}         [description]
   */
  const resolvePromise = new global.Promise(function (resolve, reject) { resolve() })

  /**
   * [description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  const start = (params) => {
    var obj = params || {}
    this.beforeLoading = obj.beforeLoading || resolvePromise
    this.updateContent = obj.updateContent || resolvePromise
    var that = this
    var links = obj.links || doc.querySelectorAll('a:not([target=_blank]):not([href^="#"]):not([data-loader-active="true"])');

    links.forEach((element) => {
      if (element.hostname !== w.location.hostname ||
          element.protocol !== w.location.protocol ||
          /#/.test(element.href)) {
        return
      }

      element.addEventListener('click', (event) => {
        if (!that.metaKeyIsPressed) {
          event.preventDefault()
          that._onClick.call(that, this)
        }
      }, false)

      element.setAttribute('data-loader-active', 'true')
    })

    events()
    replaceHistory()
  }

  return { start }
}

export default mono()
