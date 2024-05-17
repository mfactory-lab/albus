// import dccCtx from '@digitalcredentials/dcc-context'

import didContext from 'did-context'
import ed25519 from 'ed25519-signature-2020-context'
import x25519 from 'x25519-key-agreement-2020-context'
import cred from 'credentials-context'
import { JsonLdDocumentLoader } from 'jsonld-document-loader'
import { Resolver, type ResolverRegistry } from 'did-resolver'
import * as WebDidResolver from 'web-did-resolver'
import { albusDidResolver, keyDidResolver } from './did-resolver'

const {
  contexts: credentialsContext,
  constants: {
    CREDENTIALS_CONTEXT_V1_URL,
  },
} = cred

const resolver = new Resolver({
  ...WebDidResolver.getResolver(),
  ...keyDidResolver(),
  ...albusDidResolver(),
} as ResolverRegistry, {
  cache: true,
})

export const httpClientHandler = {
  async get(params: Record<string, string>): Promise<unknown> {
    if (!params.url.startsWith('http')) {
      throw new Error('NotFoundError')
    }
    let result: Response
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/ld+json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
      result = await fetch(params.url, { headers })
    } catch (e: any) {
      throw new Error(`NotFoundError loading "${params.url}": ${e.message}`)
    }
    const responseTextDecoded = await result.text()
    return JSON.parse(responseTextDecoded)
  },
}

declare type IDocumentLoaderResult = {
  contextUrl?: string
  documentUrl?: string
  document: any
}

type documentLoader = (url: string) => Promise<IDocumentLoaderResult>

declare class IJsonLdDocumentLoader {
  addStatic: (contextUrl: string, context: any) => void
  setDidResolver: any
  setProtocolHandler: any
  documentLoader: any
  build: () => documentLoader
}

type SecurityLoaderParams = {
  fetchRemoteContexts?: boolean
  useOBv3BetaContext?: boolean
}

export function securityLoader({ fetchRemoteContexts = false }: SecurityLoaderParams = {}): IJsonLdDocumentLoader {
  const loader: IJsonLdDocumentLoader = new JsonLdDocumentLoader()

  // loader.addStatic(
  //   'https://w3id.org/security/suites/ed25519-2018/v1',
  //   ed25519.contexts.get(ed25519.constants.CONTEXT_URL),
  // )

  loader.addStatic(
    ed25519.constants.CONTEXT_URL,
    ed25519.contexts.get(ed25519.constants.CONTEXT_URL),
  )

  loader.addStatic(
    x25519.constants.CONTEXT_URL,
    x25519.contexts.get(x25519.constants.CONTEXT_URL),
  )

  const didCtx = didContext.contexts.get(didContext.constants.DID_CONTEXT_URL)

  loader.addStatic('https://w3id.org/did/v1', didCtx)
  loader.addStatic(didContext.constants.DID_CONTEXT_URL, didCtx)

  // Verifiable Credentials Data Model 1.0
  loader.addStatic(
    CREDENTIALS_CONTEXT_V1_URL,
    credentialsContext.get(CREDENTIALS_CONTEXT_V1_URL),
  )

  // Verifiable Credentials Data Model 2.0 - BETA / non-final
  // loader.addStatic(vc2Context.CONTEXT_URL, vc2Context.CONTEXT);

  // loader.addStatic(dccCtx.CONTEXT_URL_V1, dccCtx.CONTEXT_V1)

  // loader.addStatic(vcStatusListCtx.CONTEXT_URL_V1, vcStatusListCtx.CONTEXT_V1)

  // Open Badges v3 Contexts, includes OBv3 Beta, 3.0, 3.0.1, 3.0.2, etc.
  // for (const [url, contextBody] of obCtx.contexts) {
  //   loader.addStatic(url, contextBody)
  // }
  //
  // if (useOBv3BetaContext) {
  //   // Workaround to validate legacy OBv3 BETA context VCs
  //   loader.addStatic(obCtx.CONTEXT_URL_V3_0_0,
  //     obCtx.contexts.get(obCtx.CONTEXT_URL_V3_BETA))
  // }

  loader.setDidResolver({
    async get({ url }) {
      const { didDocument } = await resolver.resolve(url, {
        accept: 'application/did+ld+json',
      })

      const [did, keyFragment] = url.split('#')

      if (keyFragment && didDocument) {
        const verificationMethod = `${didDocument.id}#${keyFragment}`
        const keyFragmentDoc: any | undefined = didDocument.verificationMethod.filter((method: any) => {
          return method.id === url || method.id === verificationMethod
        })[0]

        if (!keyFragmentDoc) {
          throw new Error(`${verificationMethod} is an unknown key fragment for ${did}`)
        }

        return { '@context': didDocument['@context'], ...keyFragmentDoc }
      }

      return didDocument
    },
  })

  // Enable loading of arbitrary contexts from web
  if (fetchRemoteContexts) {
    loader.setProtocolHandler({ protocol: 'http', handler: httpClientHandler })
    loader.setProtocolHandler({ protocol: 'https', handler: httpClientHandler })
  }

  return loader
}
