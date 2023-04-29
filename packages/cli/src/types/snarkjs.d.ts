declare module 'snarkjs' {
  type SnarkjsProof = {
    readonly pi_a: readonly (string | bigint)[];
    readonly pi_b: readonly (readonly (string | bigint)[])[];
    readonly pi_c: readonly (string | bigint)[];
    readonly protocol: string;
  };

  type PublicSignals = readonly (string | bigint)[];

  type SNARK = {
    readonly proof: SnarkjsProof;
    readonly publicSignals: PublicSignals;
  };

  type VK = {
    readonly nPublic: number;
    readonly curve: unknown;
    readonly vk_alpha_1: unknown;
    readonly vk_beta_2: unknown;
    readonly vk_gamma_2: unknown;
    readonly vk_delta_2: unknown;
    readonly IC: unknown;
  };

  const groth16: {
    readonly fullProve: (
      input: {
        readonly [key: string]:
          | bigint | number
          | readonly bigint[] | readonly number[]
          | readonly (readonly bigint[])[] | readonly (readonly number[])[];
      },
      wasmFile: string,
      zkeyFileName: string,
      logger?: unknown,
    ) => Promise<SNARK>;
    readonly prove: (
      zkeyFileName: string,
      witnessFilename: string,
      logger?: unknown,
    ) => Promise<SNARK>;
    readonly verify: (
      vkVerifier: VK,
      publicSignals: PublicSignals,
      proof: SnarkjsProof,
      logger?: unknown,
    ) => Promise<boolean>;
  };

  const plonk: {
    exportSolidityCallData: any;
    fullProve: any;
    prove: any;
    setup: any;
    verify: any;
  };

  const powersOfTau: {
    beacon: any;
    challengeContribute: any;
    contribute: any;
    convert: any;
    exportChallenge: any;
    exportJson: any;
    importResponse: any;
    newAccumulator: any;
    preparePhase2: any;
    truncate: any;
    verify: any;
  };

  const r1cs: {
    exportJson: (r1csName: string, logger?: unknown) => Promise<any>;
    info: (r1csName: string, logger?: unknown) => Promise<any>;
    print: (params: object, options: object) => Promise<any>;
  };

  const wtns: {
    calculate: any;
    debug: any;
    exportJson: any;
  };

  const zKey: {
    beacon: any;
    bellmanContribute: any;
    contribute: any;
    exportBellman: any;
    exportJson: any;
    exportSolidityVerifier: any;
    exportVerificationKey: (zkeyName: string) => Promise<VK>;
    importBellman: any;
    newZKey: (r1csName: string, ptauName: string, zkeyName: string, logger?: unknown) => Promise<any>;
    verifyFromInit: any;
    verifyFromR1cs: any;
  };

  export { SnarkjsProof, PublicSignals, VK, groth16, plonk, powersOfTau, r1cs, wtns, zKey };
}
