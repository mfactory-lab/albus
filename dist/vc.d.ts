import type { PublicKey } from '@solana/web3.js';
import type { CreatePresentationOptions, VerifiableCredential, VerifiedCredential as VerifiedCredentialBase } from 'did-jwt-vc';
import type { JWTVerifyOptions } from 'did-jwt';
import { xc20p } from './crypto';
export declare const DEFAULT_CONTEXT = "https://www.w3.org/2018/credentials/v1";
export declare const DEFAULT_VC_TYPE = "VerifiableCredential";
export declare const DEFAULT_VP_TYPE = "VerifiablePresentation";
export type VerifiedCredential = VerifiedCredentialBase;
export type Claims = Record<string, any>;
export interface CreateCredentialOpts {
    holder: PublicKey;
    signerSecretKey: number[] | Uint8Array;
    encryptionKey?: xc20p.PrivateKey;
    encrypt?: boolean;
    nbf?: number;
    exp?: number;
    aud?: string[];
}
/**
 * Create new verifiable credential
 */
export declare function createVerifiableCredential(claims: Claims, opts: CreateCredentialOpts): Promise<{
    payload: string;
    credentialRoot: string;
}>;
export declare function createVerifiablePresentation(credentials: VerifiableCredential[], opts?: CreatePresentationOptions): Promise<string>;
export interface VerifyCredentialOpts extends JWTVerifyOptions {
    decryptionKey?: xc20p.PrivateKey;
}
/**
 * Verify credential
 */
export declare function verifyCredential(payload: string, opts: VerifyCredentialOpts): Promise<VerifiedCredential>;
export declare function claimsTree(claims: Claims): Promise<{
    root: Uint8Array;
    find: (key: string) => Promise<import("circomlibjs").FindFromSmtResponse>;
    insert: (key: string, val: any) => Promise<import("circomlibjs").InsertIntoSmtResponse>;
    update: (key: string, val: any) => Promise<import("circomlibjs").UpdateSmtResponse>;
    delete: (key: string) => Promise<import("circomlibjs").DeleteFromSmtResponse>;
}>;
//# sourceMappingURL=vc.d.ts.map