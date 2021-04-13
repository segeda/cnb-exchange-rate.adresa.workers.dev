const BASE_URL =
  'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz'

const kurzy = {}

class KurzyElementHandler {
  element(element) {
    kurzy.banka = element.getAttribute('banka')
    kurzy.datum = element.getAttribute('datum')
    kurzy.kurzy = []
  }
}

class RadekElementHandler {
  element(element) {
    const kurz = {}
    kurz.kod = element.getAttribute('kod')
    kurz.mena = element.getAttribute('mena')
    kurz.mnozstvi = Number(element.getAttribute('mnozstvi'))
    kurz.kurz = Number(element.getAttribute('kurz').replace(',', '.'))
    kurz.zeme = element.getAttribute('zeme')
    kurzy.kurzy.push(kurz)
  }
}

async function handleJSON(request) {
  const { search } = new URL(request.url)

  const response = await fetch(BASE_URL + '.xml' + search, request)
  await new HTMLRewriter()
    .on('kurzy', new KurzyElementHandler())
    .on('radek', new RadekElementHandler())
    .transform(response)
    .arrayBuffer()

  const jsonResponse = new Response(JSON.stringify(kurzy), response)
  jsonResponse.headers.set('content-type', 'application/json;charset=UTF-8')

  return mutateResponse(jsonResponse)
}

function mutateResponse(response) {
  const mutableResponse = new Response(response.body, response)
  mutableResponse.headers.delete('x-frame-options')
  mutableResponse.headers.set('access-control-allow-origin', '*')
  mutableResponse.headers.set('author', 'Petr Severa <petr@severa.name>')
  mutableResponse.headers.set(
    'repository',
    'https://github.com/segeda/cnb-exchange-rate.adresa.workers.dev',
  )

  return mutableResponse
}

async function handleRequest(request) {
  const { pathname, search } = new URL(request.url)

  switch (pathname) {
    case '/xml':
      const xmlResponse = await fetch(BASE_URL + '.xml' + search, request)
      return mutateResponse(xmlResponse)
    case '/txt':
      const txtResponse = await fetch(BASE_URL + '.txt' + search, request)
      return mutateResponse(txtResponse)
    case '/json':
    default:
      return handleJSON(request)
  }
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})
