import { LDKeyPair } from 'crypto-ld'
import { PrivateKey, Signature, babyJub, eddsa, utils } from '../../crypto'
import { Ed25519 } from './utils'

const { bytesToBase58, bytesToBigInt, base58ToBytes } = utils

export type SerializedKeyPair = {
  id?: string
  revoked?: string
  controller?: string
  publicKeyBase58?: string
  privateKeyBase58?: string
}

export class BJJVerificationKey2021 extends LDKeyPair {
  // Used by CryptoLD harness for dispatching.
  static suite: string = 'BJJVerificationKey2021'

  // Used by CryptoLD harness's fromKeyId() method.
  static SUITE_CONTEXT = '#'

  id?: string
  type: string
  revoked?: string
  controller?: string
  publicKeyBase58?: string
  privateKeyBase58?: string

  constructor(opts: SerializedKeyPair) {
    super(opts)

    this.id = opts.id
    this.controller = opts.controller
    this.type = BJJVerificationKey2021.suite
    this.publicKeyBase58 = opts.publicKeyBase58
    this.privateKeyBase58 = opts.privateKeyBase58

    if (typeof this.publicKeyBase58 !== 'string') {
      if (this.privateKeyBase58) {
        const privateKey = PrivateKey.newFromBase58(this.privateKeyBase58)
        this.publicKeyBase58 = privateKey.public().toBase58()
      } else {
        throw new TypeError('The "publicKeyBase58" property is required.')
      }
    }

    if (this.controller && !this.id) {
      this.id = `${this.controller}#${this.fingerprint()}`
    }
  }

  static async generate(opts: {
    seed?: Uint8Array
    controller?: string
    id?: string
    revoked?: string
  } = {}): Promise<BJJVerificationKey2021> {
    let keypair: { publicKey: Uint8Array, secretKey: Uint8Array }

    if (opts.seed) {
      keypair = Ed25519.generateKeyPairFromSeed(opts.seed)
    } else {
      keypair = Ed25519.generateKeyPair()
    }

    delete opts.seed
    return new BJJVerificationKey2021({
      publicKeyBase58: bytesToBase58(keypair.publicKey),
      privateKeyBase58: bytesToBase58(keypair.secretKey),
      ...opts,
    })
  }

  static async from(
    ...options: ConstructorParameters<typeof BJJVerificationKey2021>
  ): Promise<BJJVerificationKey2021> {
    return new BJJVerificationKey2021(...options)
  }

  fingerprint(): string {
    return this.publicKeyBase58 ?? ''
  }

  verifyFingerprint(options: { fingerprint: string }) {
    return {
      verified: this.publicKeyBase58 === options.fingerprint,
    }
  }

  get _publicKeyBuffer(): Uint8Array | undefined {
    if (!this.publicKeyBase58) {
      return
    }
    return base58ToBytes(this.publicKeyBase58 ?? '')
  }

  get _privateKeyBuffer(): Uint8Array | undefined {
    return base58ToBytes(this.privateKeyBase58 ?? '')
  }

  signer() {
    const privateKeyBuffer = this._privateKeyBuffer
    return {
      id: this.id,
      async sign({ data }: { data: Uint8Array }): Promise<Uint8Array> {
        if (!privateKeyBuffer) {
          throw new Error('A private key is not available for signing.')
        }
        const sig = eddsa.signPoseidon(privateKeyBuffer, bytesToBigInt(data))
        return new Signature(sig.R8, sig.S).compress()
      },
    }
  }

  verifier() {
    const publicKeyBuffer = this._publicKeyBuffer
    return {
      async verify({ data, signature }: { data: Uint8Array, signature: Uint8Array }): Promise<boolean> {
        if (!publicKeyBuffer) {
          throw new Error('A public key is not available for verifying.')
        }
        return eddsa.verifyPoseidon(
          bytesToBigInt(data),
          Signature.newFromCompressed(signature.slice(0, 64)),
          babyJub.unpackPoint(publicKeyBuffer),
        )
      },
    }
  }

  export({ publicKey = false, privateKey = false, includeContext = false }: {
    publicKey?: boolean
    privateKey?: boolean
    includeContext?: boolean
  } = {}): SerializedKeyPair {
    if (!(publicKey || privateKey)) {
      throw new TypeError(
        'Export requires specifying either "publicKey" or "privateKey".',
      )
    }
    const exportedKey: any = { id: this.id, type: this.type }
    if (includeContext) {
      exportedKey['@context'] = BJJVerificationKey2021.SUITE_CONTEXT
    }
    if (typeof this.controller !== 'undefined') {
      exportedKey.controller = this.controller
    }
    if (publicKey) {
      exportedKey.publicKeyBase58 = this.publicKeyBase58
    }
    if (privateKey) {
      exportedKey.privateKeyBase58 = this.privateKeyBase58
    }
    if (typeof this.revoked === 'string') {
      exportedKey.revoked = this.revoked
    }
    return exportedKey
  }
}
