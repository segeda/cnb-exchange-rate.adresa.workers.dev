const XML_URL =
  'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.xml'
const TXT_URL =
  'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt'

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

async function handleJSON(search) {
  const response = await fetch(XML_URL + search)
  await new HTMLRewriter()
    .on('kurzy', new KurzyElementHandler())
    .on('radek', new RadekElementHandler())
    .transform(response)
    .arrayBuffer()

  return new Response(JSON.stringify(kurzy), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'access-control-allow-origin': '*',
      'cnb-exchange-rate': 'json',
    },
  })
}

async function handleRequest(request) {
  const { pathname, search } = new URL(request.url)

  if (pathname === '/xml') {
  }
  switch (pathname) {
    case '/xml':
      return fetch(XML_URL + search)
    case '/txt':
      return fetch(TXT_URL + search)
    case '/json':
    default:
      return handleJSON(search)
  }
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})
