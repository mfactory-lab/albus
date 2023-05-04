import { randomBytes } from 'node:crypto'
import { buildEddsa, buildPoseidonOpt } from 'circomlibjs'
import { arrayToByteLength, bigIntToArray } from './utils'

const eddsaPromise = buildEddsa()
const poseidonPromise = buildPoseidonOpt()

const hash = {
  poseidon: async (inputs: Uint8Array[]): Promise<Uint8Array> => {
    const poseidonBuild = await poseidonPromise
    // Convert inputs to LE montgomery representation then convert back to standard at end
    const result = poseidonBuild.F.fromMontgomery(
      poseidonBuild(
        inputs.map(input => poseidonBuild.F.toMontgomery(new Uint8Array(input).reverse())),
      ),
    )
    return arrayToByteLength(result, 32).reverse()
  },
}

const edBabyJubJub = {
  /**
   * Convert eddsa-babyjubjub private key to public key
   *
   * @param privateKey - babyjubjub private key
   * @returns public key
   */
  async privateKeyToPublicKey(privateKey: Uint8Array): Promise<[Uint8Array, Uint8Array]> {
    const eddsaBuild = await eddsaPromise
    const pub = eddsaBuild.prv2pub(privateKey)
    return pub.map(e => eddsaBuild.F.fromMontgomery(e).reverse()) as [Uint8Array, Uint8Array]
  },

  /**
   * Generates a random babyJubJub point
   *
   * @returns random point
   */
  genRandomPoint(): Promise<Uint8Array> {
    return hash.poseidon([randomBytes(32)])
  },

  /**
   * Creates eddsa-babyjubjub signature with poseidon hash
   *
   * @param key - private key
   * @param msg - message to sign
   * @returns signature
   */
  async signPoseidon(key: Uint8Array, msg: Uint8Array) {
    const eddsaBuild = await eddsaPromise

    // Get montgomery representation
    const montgomery = eddsaBuild.F.toMontgomery(Uint8Array.from(msg).reverse())

    // Sign
    const sig = eddsaBuild.signPoseidon(key, montgomery)

    // Convert R8 elements from montgomery and to BE
    const r8 = sig.R8.map(element => eddsaBuild.F.fromMontgomery(element).reverse())

    return {
      s: bigIntToArray(sig.S, 32),
      r8,
    }
  },

}

export { hash, edBabyJubJub }
