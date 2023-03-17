mod cluster;
// mod nft;
// mod zkp;

use std::{
    fs,
    path::{Path, PathBuf},
};

use ark_bn254::Bn254;
use ark_circom::{CircomBuilder, CircomConfig};
use ark_groth16::{generate_random_parameters, Groth16};
use ark_serialize::CanonicalSerialize;
use bellman_ce::pairing::{bn256::Bn256, Engine};
// use ark_bn254::Bn254;
// use ark_circom::{CircomBuilder, CircomConfig};
// use ark_groth16::{Groth16, Proof, ProvingKey};
// use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use clap::{Args, Parser, Subcommand};

// use mpl_token_metadata::solana_program::pubkey::Pubkey;

// use rand::thread_rng;
// use zkutil::circom_circuit::{
//     load_params_file, proof_to_json_file, prove, r1cs_from_bin_file, r1cs_from_json_file,
//     witness_from_bin_file, witness_from_json_file, CircomCircuit, R1CS,
// };

// use solana_sdk::pubkey::Pubkey;
use crate::cluster::Cluster;

#[derive(Parser, Debug)]
struct Cli {
    #[arg(short, long, env, default_value = "mainnet")]
    cluster: Cluster,
    // #[arg(short, long)]
    // fee_payer: Pubkey,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    CreateCircuitNft(CreateCircuitNft),
    CreateProofNft(CreateProofNft),
    VerifyProof,
}

#[derive(Args, Debug)]
struct CreateCircuitNft {
    #[arg(short, long)]
    name: String,
    // #[arg(short, long)]
    // r1cs_file: PathBuf,
    // #[arg(short, long)]
    // wasm_file: PathBuf,
}

#[derive(Args, Debug)]
struct CreateProofNft {
    // #[arg(short, long)]
    // circuit_key: Pubkey,
    // #[arg(short, long)]
    // input: PathBuf,
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::CreateCircuitNft(opts) => {
            let wasm_file = "./client/circuits/age.wasm";
            let r1cs_file = "./client/circuits/age.r1cs";

            let builder = CircomBuilder::new(
                CircomConfig::<Bn254>::new(&wasm_file, &r1cs_file)
                    .expect("Failed to initialize `CircomConfig`"),
            );

            // let r1cs = load_r1cs("./client/circuits/age.r1cs");

            // Create an empty instance for setting it up
            let circom = builder.setup();

            // let r1cs_json = serde_json::to_string(&circuit.cfg.r1cs).unwrap();
            // println!("r1cs_json: {}", r1cs_json);
            //
            // // Generate trusted setup
            // // let mut rng = rand::thread_rng();
            let params =
                generate_random_parameters::<Bn254, _, _>(circom, &mut rand::thread_rng()).unwrap();

            let mut bytes = vec![];
            params
                .serialize(&mut bytes)
                .expect("Failed to serialize proving key");

            // let pk = Groth16::<Bn254>::generate_random_parameters_with_reduction(
            //     circuit,
            //     &mut rand::thread_rng(),
            // )
            // .unwrap();

            // let pk_json = serde_json::to_string(&params).unwrap();
            println!("pk_json: {:?}", params);
            println!("bytes: {:?}", bytes);

            // Generate metadata json
            // TODO:

            // Upload metadata json to ipfs
            // TODO:

            // Mint new Circuit NFT
            // TODO:
        }
        Commands::CreateProofNft(opts) => {
            // params:
            //  circuit_pubkey
            //  input data (private and public)
            // load circuit metadata, load metadata json
            //  - get ProvingKey
            //  - prepare CircomBuilder

            // Generate proof
            // let pk = ProvingKey::<Bn254>::deserialize(pk_bytes)
            //     .expect("Failed to deserialize `ProvingKey`");
            // let proof = Groth16::<Bn254>::create_random_proof_with_reduction(
            //     circuit,
            //     &pk,
            //     &mut rand::thread_rng(),
            // )
            // .unwrap();
            //
            // println!("{:?}", proof);

            // let proof =
            //     create_random_proof::<Bn254, _, _>(circuit, &pk, &mut rand::thread_rng()).unwrap();
            // let mut proof_bytes = vec![];
            // proof.serialize(&mut proof_bytes).unwrap();

            // mint new proof nft
        }
        _ => {}
    }
}
//
// fn load_r1cs(filename: &str) -> R1CS<Bn256> {
//     if filename.ends_with("json") {
//         r1cs_from_json_file(filename)
//     } else {
//         let (r1cs, _wire_mapping) = r1cs_from_bin_file(filename).unwrap();
//         r1cs
//     }
// }
//
// fn resolve_circuit_file(filename: Option<String>) -> String {
//     match filename {
//         Some(s) => s,
//         None => {
//             if Path::new("circuit.r1cs").exists() || !Path::new("circuit.json").exists() {
//                 "circuit.r1cs".to_string()
//             } else {
//                 "circuit.json".to_string()
//             }
//         }
//     }
// }
//
// fn load_witness<E: Engine>(filename: &str) -> Vec<E::Fr> {
//     if filename.ends_with("json") {
//         witness_from_json_file::<E>(filename)
//     } else {
//         witness_from_bin_file::<E>(filename).unwrap()
//     }
// }
//
// fn resolve_witness_file(filename: Option<String>) -> String {
//     match filename {
//         Some(s) => s,
//         None => {
//             if Path::new("witness.wtns").exists() || !Path::new("witness.json").exists() {
//                 "witness.wtns".to_string()
//             } else {
//                 "witness.json".to_string()
//             }
//         }
//     }
// }
//
// fn create_proof(opts: ProveOpts) {
//     let rng = &mut rand::thread_rng();
//     let params = load_params_file(&opts.params);
//     let circuit_file = resolve_circuit_file(opts.circuit);
//     let witness_file = resolve_witness_file(opts.witness);
//     println!("Loading circuit from {}...", circuit_file);
//     let circuit = CircomCircuit {
//         r1cs: load_r1cs(&circuit_file),
//         witness: Some(load_witness::<Bn256>(&witness_file)),
//         wire_mapping: None,
//     };
//     println!("Proving...");
//     let proof = prove(circuit.clone(), &params, rng).unwrap();
//     proof_to_json_file(&proof, &opts.proof).unwrap();
//     fs::write(&opts.public, circuit.get_public_inputs_json().as_bytes()).unwrap();
//     println!("Saved {} and {}", opts.proof, opts.public);
// }

fn process_create_circuit_nft(cli: &Cli) {
    // load R1CS
    // load WASM
    // prepare CircomBuilder
    // generate ProvingKey
    // generate metadata json
    // upload metadata json to arweave
    // mint new Circuit NFT
}

fn process_generate_proof() {
    // params:
    //  circuit_pubkey
    //  input data (private and public)
    // load circuit
    //  - get ProvingKey
    //  - prepare CircomBuilder
    // generate_proof
    // mint new proof nft
}

fn process_verify_proof() {
    // params:
    //  - circuit_pubkey
    //  - proof_pubkey
    //  - public input
}
