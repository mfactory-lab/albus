/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

export enum CredentialType {
  AlbusCredential = 'AlbusCredential',
  IdCard = 'IdCard',
  Passport = 'Passport',
  ResidencePermit = 'ResidencePermit',
  DriverLicense = 'DriverLicense',
  AttendanceProof = 'AttendanceProof',
  LivenessProof = 'LivenessProof',
  Geofencing = 'Geofencing',
}

export enum PresentationType {
  AlbusPresentation = 'AlbusPresentation',
}

export enum ProofType {
  BJJSignature2021 = 'BJJSignature2021',
  Ed25519Signature2020 = 'Ed25519Signature2020',
}

export enum VerifyType {
  BJJVerificationKey2021 = 'BJJVerificationKey2021',
  Ed25519VerificationKey2020 = 'Ed25519VerificationKey2020',
}

type Extensible<T> = T & { [x: string]: any }

export type W3CCredential = Extensible<{
  // The first element of the @context array must be the VC context itself
  // Subsequent elements are either URLs for other contexts OR
  // inline context objects.
  // https://www.w3.org/TR/vc-data-model/#contexts
  '@context': string[] | any

  // https://www.w3.org/TR/vc-data-model/#identifiers
  'id'?: string

  // https://www.w3.org/TR/vc-data-model/#types
  'type': string | string[]

  // https://www.w3.org/TR/vc-data-model/#issuer
  'issuer': string | IssuerObject

  'issuanceDate'?: string

  // https://www.w3.org/TR/vc-data-model/#validity-period
  'validFrom'?: string

  // https://www.w3.org/TR/vc-data-model/#validity-period
  'validUntil'?: string

  // https://www.w3.org/TR/vc-data-model/#credential-subject
  'credentialSubject': CredentialSubject // | CredentialSubject[]

  // https://www.w3.org/TR/vc-data-model/#status
  'credentialStatus'?: CredentialStatus | CredentialStatus[]

  // https://www.w3.org/TR/vc-data-model/#data-schemas
  'credentialSchema'?: CredentialSchema | CredentialSchema[]

  // https://www.w3.org/TR/vc-data-model/#integrity-of-related-resources
  'relatedResource'?: RelatedResource | RelatedResource[]

  // https://www.w3.org/TR/vc-data-model/#evidence
  'evidence'?: Evidence | Evidence[]

  // https://www.w3.org/TR/vc-data-model/#refreshing
  'refreshService'?: RefreshService | RefreshService[]

  // https://www.w3.org/TR/vc-data-model/#terms-of-use
  'termsOfUse'?: TermsOfUse | TermsOfUse[]

  // https://w3c-ccg.github.io/confidence-method-spec
  'confidenceMethod'?: ConfidenceMethod | ConfidenceMethod[]

  // https://w3c-ccg.github.io/vc-render-method
  'renderMethod'?: RenderMethod | RenderMethod[]
}>

export type W3CPresentation = Extensible<{
  // https://www.w3.org/TR/vc-data-model/#contexts
  '@context': string[] | any

  // A 'type' property is required for VPs
  // see https://www.w3.org/TR/vc-data-model/#presentations-0
  'type': string | string[]

  // Optional, expected to be a URI for the entity presenting the VP
  'holder'?: string

  // Including VCs in a VP is optional; "empty" VPs are used for DID Auth
  'verifiableCredential'?: VerifiableCredential | VerifiableCredential[]

  // https://www.w3.org/TR/vc-data-model/#refreshing
  'refreshService'?: RefreshService
}>

export type VerifiableCredential = Verifiable<W3CCredential>

export type VerifiablePresentation = Verifiable<W3CPresentation>

export type Verifiable<T> = T & { proof: Proof | Proof[] }

export type Proof = Extensible<{ type: string, proofValue?: string, challenge?: string, verificationMethod?: string }>

// https://www.w3.org/TR/vc-data-model/#credential-subject
export type CredentialSubject = Extensible<LinkedDataObject>

// https://www.w3.org/TR/vc-data-model/#status
export type CredentialStatus = Extensible<{
  // id and type are required for `credentialStatus` by the VC spec
  id?: string
  type: string | string[]
  // Each status type has its own required fields. For example:
  // https://w3c.github.io/vc-bitstring-status-list
  statusPurpose?: string
  statusListIndex?: string | number
  statusListCredential?: string
} & LinkedDataObject>

export type LinkedDataObject = {
  id?: string
  type?: string | string[]
  name?: string
  description?: string
  image?: string | ImageObject
}

export type IssuerObject = Extensible<{ id: string, url?: string } & LinkedDataObject>

export type ImageObject = Extensible<{ id: string, type?: string | string[] }>

// https://www.w3.org/TR/vc-data-model/#data-schemas
export type CredentialSchema = Extensible<{ id: string, type: string }>

// https://www.w3.org/TR/vc-data-model/#terms-of-use
export type TermsOfUse = Extensible<{ id?: string, type: string }>

// https://www.w3.org/TR/vc-data-model/#refreshing
export type RefreshService = Extensible<{ type: string }>

// https://www.w3.org/TR/vc-data-model/#evidence
export type Evidence = Extensible<{ id?: string, type: string }>

// https://w3c-ccg.github.io/confidence-method-spec
export type ConfidenceMethod = Extensible<{ id?: string, type: string }>

// https://w3c-ccg.github.io/vc-render-method
export type RenderMethod = Extensible<{ type: string }>

// https://www.w3.org/TR/vc-data-model/#integrity-of-related-resources
export type RelatedResource = {
  id: string
  digestSRI: string
  mediaType?: string
}
