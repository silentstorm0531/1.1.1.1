import '../styles/base.styl'

async function init () {
  const form = <HTMLFormElement>document.getElementById('purge-cache-form')!
  const submitButton = <HTMLElement>document.getElementById('submit-button')!
  const info = <HTMLElement>document.getElementById('info-message')!

  form.onsubmit = function(evt) {
    evt.preventDefault()

    const params = new FormData(form)
    const qs = ['domain', 'type']
      .map(p => [p, params.get(p)])
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')

    setLoading(true)
    fetch(`https://resolver-cache-purger.cfdata.org?${qs}`, {
      method: 'POST'
    })
      .then(async res => {
        const body = await res.text()
        setMessage(body.slice(0, 500) || `(${res.status}) ${res.statusText}`, !res.ok)
      })
      .catch(err => setMessage(err, true))
      .then(() => setLoading(false))
  }

  function setLoading (loading: boolean) {
    submitButton.setAttribute('value', loading ? 'Sending...' : 'Purge Cache')
    if (loading) {
      submitButton.setAttribute('disabled', '')
    } else {
      submitButton.removeAttribute('disabled')
    }
  }

  function setMessage (message: string, error: boolean) {
    info.textContent = message
    info.classList.add(error ? 'error' : 'success')
    info.classList.remove(!error ? 'error' : 'success')
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
