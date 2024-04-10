import { type IPresentationDefinition, PEX } from '@sphereon/pex'
import type { IPresentation, OriginalVerifiableCredential } from '@sphereon/ssi-types'
import type { VerifiableCredential, VerifiablePresentation } from '@albus-finance/core'

export class PexHelper {
  private static pex = new PEX()

  private constructor() {
  }

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   */
  static validateDefinition(def: IPresentationDefinition) {
    return PEX.validateDefinition(def)
  }

  /**
   * The selectFrom method is a helper function that helps filter out the verifiable credentials
   * which can not be selected and returns the selectable credentials.
   */
  static selectFrom(def: IPresentationDefinition, creds: VerifiableCredential[]) {
    return this.pex.selectFrom(def, creds as OriginalVerifiableCredential[])
  }

  /**
   * This method helps create an Unsigned Presentation.
   * An Unsigned Presentation after signing becomes a Presentation.
   * And can be sent to the verifier after signing it.
   */
  static presentationFrom(def: IPresentationDefinition, creds: VerifiableCredential[]) {
    return this.pex.presentationFrom(def, creds as OriginalVerifiableCredential[])
  }

  /**
   * The evaluatePresentation compares what is expected from a presentation with a presentationDefinition.
   */
  static evaluatePresentation(def: IPresentationDefinition, vp: VerifiablePresentation) {
    return this.pex.evaluatePresentation(def, vp as IPresentation)
  }
}
