/// <reference types="node" />
import { Buffer } from 'node:buffer';
import type { PublicSignals, SnarkjsProof, VK } from 'snarkjs';
import { groth16 } from 'snarkjs';
type Input = Parameters<typeof groth16.fullProve>[0];
interface GenerateProofProps {
    wasmFile: string | Buffer;
    zkeyFile: string | Buffer;
    input?: Input;
    logger?: unknown;
}
/**
 * Generates a proof using the `groth16` proof system.
 * @returns {Promise<SNARK>}
 */
export declare function generateProof(props: GenerateProofProps): Promise<{
    readonly proof: SnarkjsProof;
    readonly publicSignals: PublicSignals;
}>;
interface VerifyProofProps {
    vk: VK;
    publicInput?: PublicSignals;
    proof: SnarkjsProof;
    logger?: unknown;
}
/**
 * Verify ZKP Proof
 */
export declare function verifyProof(props: VerifyProofProps): Promise<boolean>;
export {};
//# sourceMappingURL=zkp.d.ts.map