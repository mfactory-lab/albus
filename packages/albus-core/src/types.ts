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
}

export enum VerifyType {
  EddsaBJJVerificationKey = 'EddsaBJJVerificationKey',
}

export type Claims = Record<string, any>

export type CredentialStatus = {
  id: string
  type: string
}

type Extensible<T> = T & { [x: string]: any }

/**
 * Represents a readonly representation of a verifiable object, including the {@link Proof}
 * property that can be used to verify it.
 */
export type Verifiable<T> = Readonly<T> & { readonly proof: Proof }
export type Proof = Extensible<{ type?: string }>
export type IssuerType = Extensible<{ id: string }> | string
export type DateType = string | Date

export type W3CCredential = Extensible<{
  '@context': string[]
  id?: string
  type: string[]
  issuer: IssuerType
  issuanceDate: string
  validFrom?: string
  validUntil?: string
  credentialSubject: Claims // Extensible<{ id: string }>
  credentialStatus?: CredentialStatus
  evidence?: any
  termsOfUse?: any
}>

export type W3CPresentation = Extensible<{
  '@context': string[]
  type: string[]
  id?: string
  verifiableCredential?: VerifiableCredential[]
  holder: string
  verifier?: string[]
  issuanceDate?: string
  validFrom?: string
}>

/**
 * A union type for both possible representations of a Credential (JWT and W3C standard)
 *
 * @see https://www.w3.org/TR/vc-data-model/#proof-formats
 */
export type VerifiableCredential = Verifiable<W3CCredential>

/**
 * A union type for both possible representations of a Presentation (JWT and W3C standard)
 *
 * @see https://www.w3.org/TR/vc-data-model/#proof-formats
 */
export type VerifiablePresentation = Verifiable<W3CPresentation>
