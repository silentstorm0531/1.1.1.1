import '../styles/base.styl'

import { logoBanner } from './console'
import initInstructionPicker from './instruction-picker'

import uuidv4 from 'uuid/v4'
const ipV6Pattern = /^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$/

console.log(logoBanner)
console.log(window.btoa('Join us and help build a better Internet https://cloudflare.com/careers?utm=1.1.1.1-DNS'))

interface TraceInfo {
  [index: string]: string
  fl: string
  h: string
  ip: string
  ts: string
  visit_scheme: string
  uag: string
  colo: string
  spdy: string
  http: string
  loc: string
}

interface ResolverInfo {
  "ip": string
  "ip_version": number
  "protocol": string
  "dnssec": boolean
  "edns": number
  "client_subnet": number
  "qname_minimization": boolean
}

function setRef (ref: string, value: any) {
  const element = <HTMLElement>document.querySelector(`[data-ref="${ref}"]`)!

  switch (typeof value) {
    case 'undefined':
      element.textContent = '❌ Error. See developer console.'
      break
      case 'boolean':
      element.textContent = value ? 'Yes' : 'No'
      break
    default:
      element.textContent = value.toString()
  }
}

async function init () {
  initInstructionPicker()
  // https://[2606:4700:4700::1111]/resolvertest

  const traceInfo = {} as TraceInfo
  let traceEnd: number
  const traceStart = Date.now()

  try {
    const traceResponse = await fetch('/cdn-cgi/trace')
    traceEnd = Date.now() - traceStart
    const traceContent = await traceResponse.text()

    traceContent
      .split('\n')
      .filter(isPresent => isPresent)
      .map(line => line.split('='))
      .forEach(pair => traceInfo[pair[0]] = pair[1])
  } catch (error) {
    traceEnd = Date.now() - traceStart
    console.log('Trace error:', error)
  }

  setRef('myIPAddress', traceInfo.ip)
  setRef('datacenterLocation', traceInfo.colo)
  setRef('datacenterConnectionSpeed', `${traceEnd}ms`)
  setRef('supportsIPv6', ipV6Pattern.test(traceInfo.ip))

  let resolverInfo = {} as ResolverInfo

  try {
    const resolverResponse = await fetch(`https://${uuidv4()}.map.cloudflareresolve.com`)
    resolverInfo = await resolverResponse.json()
  } catch (error) {
    console.log('Resolver error:', error)
  }

  setRef('dnsResolverIP', resolverInfo.ip)
  setRef('supportsDNSSEC', resolverInfo.dnssec)

  console.debug({traceInfo, resolverInfo})
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
