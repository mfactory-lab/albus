/// <reference types="node" />
import { Buffer } from 'node:buffer';
import type { Wallet } from '@coral-xyz/anchor';
import { EventManager as AnchorEventManager, AnchorProvider, BorshCoder } from '@coral-xyz/anchor';
import type { Commitment, ConfirmOptions, Connection, PublicKeyInitData } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type { Proof } from './generated';
import { ProofRequest, ProofRequestStatus, ServiceProvider } from './generated';
export declare class AlbusClient {
    readonly provider: AnchorProvider;
    programId: PublicKey;
    constructor(provider: AnchorProvider);
    static factory(connection: Connection, wallet?: Wallet, opts?: ConfirmOptions): AlbusClient;
    get connection(): Connection;
    get manager(): ManagerClient;
    get eventManager(): EventManager;
    /**
     * Verify that the selected user, specified by {@link props.user},
     * is compliant with respect to the {@link props.circuit}
     * and the service provider.
     * If the {@link props.full} property is set to true,
     * the full verification process will be performed.
     *
     * @param {CheckCompliance} props
     */
    verifyCompliance(props: CheckCompliance): Promise<boolean>;
    /**
     * Verify proof request for the specified service code and circuit.
     * If {@link user} is undefined, provider.pubkey will be used.
     *
     * @param {string} serviceCode
     * @param {PublicKeyInitData} circuit
     * @param {PublicKeyInitData|undefined} user
     * @returns {Promise<boolean>}
     */
    verifySpecific(serviceCode: string, circuit: PublicKeyInitData, user?: PublicKeyInitData): Promise<boolean>;
    /**
     * Verify proof request by specified address
     *
     * @param {PublicKeyInitData} addr
     * @returns {Promise<boolean>}
     */
    verifyProofRequest(addr: PublicKeyInitData): Promise<boolean>;
    /**
     * Verify proof request
     *
     * @param {ProofRequest} proofRequest
     * @returns {Promise<boolean>}
     */
    private verifyProofRequestInternal;
    /**
     * Validates a Zero Knowledge Proof (ZKP) request.
     *
     * @param {ProofRequest} req The proof request object to validate.
     * @throws An error with a message indicating why the request is invalid.
     */
    validateProofRequest(req: ProofRequest): Promise<void>;
    /**
     * Load and validate Circuit NFT
     */
    loadCircuit(addr: PublicKeyInitData): Promise<{
        address: PublicKey;
        code: string;
        input: string[];
        wasmUrl: string;
        zkeyUrl: string;
        vk: any;
    }>;
    /**
     * Load and validate Verifiable Credential
     */
    loadCredential(addr: PublicKeyInitData, opts?: {
        decryptionKey?: PrivateKey;
    }): Promise<{
        address: PublicKey;
        credentialSubject: {
            id?: string | undefined;
        } & {
            [x: string]: any;
        };
        credentialRoot: any;
        verified: true;
    }>;
    /**
     * Load and validate Verifiable Presentation
     */
    loadPresentation(addr: PublicKeyInitData, _opts?: {
        decryptionKey?: PrivateKey;
    }): Promise<{
        address: PublicKey;
    }>;
    /**
     * Prove the request
     */
    prove(props: ProveProps): Promise<{
        signature: string;
        proof: SnarkjsProof;
        publicSignals: PublicSignals;
    }>;
    /**
     * Save proof for provided proof request
     */
    private proveOnChain;
    /**
     * Create new {@link ProofRequest}
     */
    createProofRequest(props: CreateProofRequestProps, opts?: ConfirmOptions): Promise<{
        address: PublicKey;
        signature: string;
    }>;
    /**
     * Delete {@link ProofRequest}
     */
    deleteProofRequest(props: DeleteProofRequestProps, opts?: ConfirmOptions): Promise<{
        signature: string;
    }>;
    /**
     * Find available service providers
     */
    findServiceProviders(filter?: {
        authority?: PublicKeyInitData;
    }): Promise<{
        pubkey: PublicKey;
        data: ServiceProvider;
    }[]>;
    /**
     * Load service provider by {@link addr}
     */
    loadServiceProvider(addr: PublicKeyInitData, commitment?: Commitment): Promise<ServiceProvider>;
    /**
     * Find available proof requests
     */
    findProofRequests(filter?: FindProofRequestProps): Promise<{
        pubkey: PublicKey;
        data: ProofRequest;
    }[]>;
    /**
     * Load proof request by {@link addr}
     */
    loadProofRequest(addr: PublicKeyInitData, commitment?: Commitment): Promise<ProofRequest>;
    /**
     * Get channel device PDA
     */
    getProofRequestPDA(service: PublicKeyInitData, circuit: PublicKeyInitData, user: PublicKeyInitData): [PublicKey, number];
    /**
     * Get service provider PDA
     */
    getServiceProviderPDA(code: string): [PublicKey, number];
    /**
     * Load and validate NFT Metadata
     * @private
     */
    private loadNft;
}
declare class EventManager {
    readonly client: AlbusClient;
    _coder: BorshCoder;
    _events: AnchorEventManager;
    constructor(client: AlbusClient);
    /**
     * Invokes the given callback every time the given event is emitted.
     *
     * @param eventName The PascalCase name of the event, provided by the IDL.
     * @param callback  The function to invoke whenever the event is emitted from
     *                  program logs.
     */
    addEventListener(eventName: string, callback: (event: any, slot: number, signature: string) => void): number;
    /**
     * Unsubscribes from the given listener.
     */
    removeEventListener(listener: number): Promise<void>;
}
declare class ManagerClient {
    private readonly client;
    constructor(client: AlbusClient);
    get provider(): AnchorProvider;
    /**
     * Verify the {@link ProofRequest}
     * Required admin authority
     */
    verifyProofRequest(props: VerifyProps, opts?: ConfirmOptions): Promise<{
        signature: string;
    }>;
    /**
     * Reject existing {@link ProofRequest}
     * Required admin authority
     */
    rejectProofRequest(props: VerifyProps, opts?: ConfirmOptions): Promise<{
        signature: string;
    }>;
    /**
     * Add new {@link ServiceProvider}
     * Required admin authority
     */
    addServiceProvider(props: AddServiceProviderProps, opts?: ConfirmOptions): Promise<{
        address: PublicKey;
        signature: string;
    }>;
    /**
     * Delete a {@link ServiceProvider}
     * Required admin authority
     */
    deleteServiceProvider(props: DeleteServiceProviderProps, opts?: ConfirmOptions): Promise<{
        signature: string;
    }>;
}
export type PrivateKey = number[] | string | Buffer | Uint8Array;
export interface FindProofRequestProps {
    user?: PublicKeyInitData;
    serviceProvider?: PublicKeyInitData;
    circuit?: PublicKeyInitData;
    status?: ProofRequestStatus;
}
export interface CreateProofRequestProps {
    serviceCode: string;
    circuit: PublicKeyInitData;
    expiresIn?: number;
}
export interface DeleteProofRequestProps {
    proofRequest: PublicKeyInitData;
}
export interface AddServiceProviderProps {
    code: string;
    name: string;
}
export interface DeleteServiceProviderProps {
    code: string;
}
export interface ProveProps {
    proofRequest: PublicKeyInitData;
    vc: PublicKeyInitData;
    decryptionKey?: PrivateKey;
    force?: boolean;
}
export interface ProveOnChainProps {
    proofRequest: PublicKeyInitData;
    proof: Proof;
}
export interface VerifyProps {
    proofRequest: PublicKeyInitData;
}
export interface CheckCompliance {
    serviceCode: string;
    circuit: PublicKeyInitData;
    user?: PublicKeyInitData;
    full?: boolean;
}
export {};
//# sourceMappingURL=client.d.ts.map