#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(clippy::uninlined_format_args)]

mod circuit;

use bellman::{
    self,
    groth16::{
        create_proof, generate_random_parameters, prepare_verifying_key, verify_proof,
        Proof as BellmanProof,
    },
};
use bls12_381::{Bls12, Scalar};
use ff::{Field, PrimeField};
use rand::{thread_rng, Rng};

use crate::circuit::CubeDemo;

fn main() {
    // This may not be cryptographically safe, use
    // `OsRng` (for example) in production software.
    let mut rng = thread_rng();

    println!("Creating parameters...");

    // Create parameters for our circuit
    let params = {
        let c = CubeDemo::<Scalar> { x: None };
        generate_random_parameters::<Bls12, _, _>(c, &mut rng).unwrap()
    };

    println!(
        "params 1: {}, {}, {}, {}, {}",
        params.l.len(),
        params.h.len(),
        params.a.len(),
        params.b_g1.len(),
        params.b_g2.len()
    );
    // Prepare the verification key (for proof verification)
    // let pvk = prepare_verifying_key(&params.vk);

    println!("Creating proofs...");

    // Create an instance of circuit
    let c = CubeDemo::<Scalar> {
        x: Scalar::from_str_vartime("3"),
    };

    let assignments =
        groth16::assignments::extract_assignments::<CubeDemo<Scalar>, Bls12>(c).unwrap();
    let (input, aux) = assignments.get_assignments();
    let m = assignments.num_constraints();
    let cap = assignments.qap();
    let r = Scalar::random(&mut rng);
    let s = Scalar::random(&mut rng);

    let groth_params = groth16::assignments::create_params(params);

    let proof = groth16::prover::create_proof::<Bls12>(
        groth_params.clone(),
        input.as_ref(),
        aux.as_ref(),
        r,
        s,
        cap,
        m,
    );

    println!("groth proof: {:#?}", proof);

    println!("{:#?}", &input[1..]);

    groth16::verifier::verify_proof(&proof, &input[1..], &groth_params.vk).unwrap();

    // let bellproof = create_proof(c, &params, r.clone(), s.clone()).unwrap();
    // println!("bellman proof: {:?}", bellproof);

    // let bproof = BellmanProof {
    //     a: grothproof.a.clone(),
    //     b: grothproof.b.clone(),
    //     c: grothproof.c.clone(),
    // };
    // verify_proof(&pvk, &bproof, &input[1..]).expect("Verification error");
}
