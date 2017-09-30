
/**
 * Simple handler for XMLHttprequests.
 * @return object [description]
 */
const ajax = () => {
  return {
    get: (url) => {
      return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest()
        req.open('GET', url, true)

        req.onload = function () {
          if (req.status >= 200 && req.status < 400) {
            resolve(req.response)
            return
          }

          reject(req.response)
        }

        req.onerror = () => {
          reject(Error('Network Error'))
        }

        req.send()
      })
    }
  }
}

export default ajax()
