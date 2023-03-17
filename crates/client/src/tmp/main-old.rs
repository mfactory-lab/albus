// #![allow(unused_imports)]
// #![allow(unused_variables)]
// #![allow(clippy::uninlined_format_args)]
//
// use bellman::{
//     self,
//     groth16::{
//         create_proof, generate_random_parameters, prepare_verifying_key, verify_proof,
//         Proof as BellmanProof,
//     },
// };
// use bls12_381::{Bls12, G1Affine, G2Affine, Scalar};
// use ff::{Field, PrimeField};
// use groth16::{Proof, VerificationKey};
// use pairing::group::GroupEncoding;
// use rand::{thread_rng, Rng};
//
// use crate::circuits::cube::CubeDemo;
//
// mod circuits;
//
// fn main() {
//     // This may not be cryptographically safe, use
//     // `OsRng` (for example) in production software.
//     // let mut rng = thread_rng();
//
//     let mut rng = &mut {
//         use rand::SeedableRng;
//         // arbitrary seed
//         let seed = [
//             1, 0, 0, 0, 23, 0, 0, 0, 200, 1, 0, 0, 210, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//             0, 0, 0, 0, 0,
//         ];
//         rand::rngs::StdRng::from_seed(seed)
//     };
//
//     println!("Creating parameters...");
//
//     // Create parameters for our circuit
//     let params = {
//         let c = CubeDemo::<Scalar> { x: None };
//         generate_random_parameters::<Bls12, _, _>(c, &mut rng).unwrap()
//     };
//
//     println!(
//         "params 1: {}, {}, {}, {}, {}",
//         params.l.len(),
//         params.h.len(),
//         params.a.len(),
//         params.b_g1.len(),
//         params.b_g2.len()
//     );
//     // Prepare the verification key (for proof verification)
//     // let pvk = prepare_verifying_key(&params.vk);
//
//     println!("Creating proofs...");
//
//     // Create an instance of circuit
//     let c = CubeDemo::<Scalar> {
//         x: Scalar::from_str_vartime("3"),
//     };
//
//     let assignments =
//         groth16::assignments::extract_assignments::<CubeDemo<Scalar>, Bls12>(c).unwrap();
//     let (input, aux) = assignments.get_assignments();
//     let m = assignments.num_constraints();
//     let cap = assignments.qap();
//     let r = Scalar::random(&mut rng);
//     let s = Scalar::random(&mut rng);
//
//     let groth_params = groth16::assignments::create_params(params);
//
//     let proof = groth16::prover::create_proof::<Bls12>(
//         groth_params.clone(),
//         input.as_ref(),
//         aux.as_ref(),
//         r,
//         s,
//         cap,
//         m,
//     );
//
//     // let proof: Proof<Bls12> = Proof {
//     //     a: G1Affine::from_compressed(&[
//     //         175, 52, 204, 96, 240, 35, 114, 112, 215, 35, 81, 76, 49, 190, 41, 14, 225, 14, 93,
//     //         174, 147, 196, 131, 15, 235, 30, 151, 199, 53, 51, 244, 175, 195, 67, 255, 246, 209,
//     //         112, 114, 32, 34, 66, 5, 102, 36, 185, 205, 80,
//     //     ])
//     //     .unwrap(),
//     //     b: G2Affine::from_compressed(&[
//     //         173, 42, 216, 40, 88, 155, 44, 17, 201, 59, 211, 245, 30, 156, 87, 108, 16, 170, 99,
//     //         85, 75, 118, 75, 36, 216, 97, 33, 144, 253, 74, 175, 194, 141, 188, 71, 172, 147, 231,
//     //         3, 182, 2, 68, 156, 132, 6, 128, 145, 66, 4, 215, 14, 12, 176, 150, 244, 9, 15, 22,
//     //         158, 250, 225, 110, 148, 9, 254, 100, 244, 219, 201, 172, 66, 250, 113, 238, 39, 60,
//     //         248, 93, 202, 131, 193, 31, 174, 125, 73, 195, 5, 163, 114, 235, 208, 39, 60, 159, 63,
//     //         12,
//     //     ])
//     //     .unwrap(),
//     //     c: G1Affine::from_compressed(&[
//     //         165, 163, 108, 50, 84, 69, 43, 42, 148, 229, 112, 92, 164, 219, 234, 98, 6, 28, 189,
//     //         206, 21, 46, 187, 209, 220, 74, 235, 255, 142, 76, 157, 167, 98, 225, 97, 240, 120, 82,
//     //         151, 172, 67, 153, 77, 147, 130, 25, 88, 212,
//     //     ])
//     //     .unwrap(),
//     // };
//
//     println!("a: {:?}", proof.a.to_uncompressed());
//     println!("b: {:?}", proof.b.to_uncompressed());
//     println!("c: {:?}", proof.c.to_uncompressed());
//     // println!("groth proof: {:#?}", proof);
//
//     // alpha_g1: [167, 13, 74, 43, 54, 202, 229, 245, 120, 19, 159, 52, 232, 92, 114, 133, 242, 61, 145, 245, 211, 186, 108, 71, 10, 214, 156, 253, 17, 207, 69, 6, 182, 209, 216, 160, 0, 193, 39, 74, 119, 128, 236, 151, 5, 2, 182, 205]
//     // beta_g1: [172, 129, 129, 45, 177, 132, 186, 226, 101, 29, 186, 197, 251, 11, 87, 28, 147, 247, 44, 167, 175, 166, 173, 195, 128, 43, 63, 165, 157, 228, 229, 54, 148, 222, 59, 96, 237, 128, 5, 226, 119, 194, 29, 3, 245, 135, 126, 249]
//     // beta_g2: [138, 122, 16, 92, 40, 38, 40, 87, 25, 231, 41, 160, 223, 233, 204, 203, 4, 8, 79, 134, 107, 211, 83, 202, 249, 109, 21, 194, 189, 188, 225, 145, 129, 188, 226, 162, 156, 85, 96, 125, 18, 189, 241, 78, 220, 80, 144, 132, 21, 102, 232, 161, 212, 10, 201, 61, 131, 235, 105, 122, 27, 158, 85, 234, 53, 175, 33, 164, 194, 6, 226, 134, 255, 16, 59, 26, 149, 169, 193, 6, 9, 191, 88, 40, 115, 83, 9, 235, 44, 248, 14, 108, 218, 50, 241, 219]
//     // gamma_g2: [137, 190, 115, 234, 213, 227, 151, 237, 1, 181, 233, 105, 221, 217, 204, 25, 216, 100, 192, 93, 124, 32, 85, 91, 36, 176, 244, 197, 188, 186, 158, 208, 114, 130, 34, 168, 30, 196, 42, 51, 235, 62, 141, 146, 70, 177, 244, 255, 17, 2, 71, 118, 47, 159, 49, 185, 242, 60, 161, 7, 166, 177, 143, 155, 10, 21, 42, 4, 192, 132, 84, 36, 120, 13, 122, 239, 76, 52, 234, 122, 32, 92, 50, 225, 113, 120, 57, 123, 207, 40, 156, 108, 151, 11, 58, 206]
//     // delta_g1: [131, 145, 0, 8, 141, 199, 177, 36, 31, 57, 155, 91, 197, 85, 169, 0, 229, 220, 217, 165, 244, 64, 19, 14, 67, 46, 228, 84, 149, 230, 47, 238, 185, 228, 47, 202, 140, 47, 184, 215, 48, 197, 72, 190, 112, 92, 158, 93]
//     // delta_g2: [185, 137, 210, 30, 246, 224, 255, 166, 194, 53, 20, 131, 212, 158, 114, 177, 97, 64, 71, 203, 251, 3, 175, 94, 40, 123, 153, 194, 237, 45, 249, 132, 21, 242, 188, 117, 70, 54, 187, 157, 104, 44, 32, 89, 174, 78, 12, 151, 11, 165, 112, 167, 214, 93, 194, 151, 73, 213, 236, 56, 238, 255, 157, 174, 77, 143, 146, 54, 157, 117, 193, 162, 32, 87, 234, 63, 160, 124, 182, 242, 166, 234, 239, 248, 150, 198, 220, 65, 174, 58, 16, 27, 245, 92, 101, 206]
//     // ic: [[161, 83, 243, 153, 234, 45, 160, 104, 77, 78, 4, 153, 96, 229, 71, 125, 249, 143, 61, 152, 26, 144, 35, 7, 209, 67, 190, 9, 210, 225, 149, 214, 215, 83, 212, 27, 245, 126, 30, 100, 61, 244, 158, 251, 88, 172, 1, 68], [176, 154, 24, 221, 116, 214, 158, 122, 253, 166, 18, 54, 54, 59, 10, 164, 44, 179, 129, 193, 111, 152, 135, 73, 7, 177, 27, 82, 123, 92, 227, 13, 113, 41, 247, 94, 86, 222, 98, 92, 11, 252, 157, 198, 85, 186, 11, 197]]
//
//     println!("alpha_g1: {:?}", groth_params.vk.alpha_g1.to_uncompressed());
//     println!("beta_g1: {:?}", groth_params.vk.beta_g1.to_uncompressed());
//     println!("beta_g2: {:?}", groth_params.vk.beta_g2.to_uncompressed());
//     println!("gamma_g2: {:?}", groth_params.vk.gamma_g2.to_uncompressed());
//     println!("delta_g1: {:?}", groth_params.vk.delta_g1.to_uncompressed());
//     println!("delta_g2: {:?}", groth_params.vk.delta_g2.to_uncompressed());
//     println!(
//         "ic: {:?}",
//         groth_params
//             .vk
//             .ic
//             .iter()
//             .map(|i| i.to_uncompressed())
//             .collect::<Vec<_>>()
//     );
//
//     groth16::verifier::verify_proof(
//         &proof,
//         &[Scalar::from_str_vartime("35").unwrap()],
//         &groth_params.vk,
//     )
//     .unwrap();
//
//     // let bellproof = create_proof(c, &params, r.clone(), s.clone()).unwrap();
//     // println!("bellman proof: {:?}", bellproof);
//
//     // let bproof = BellmanProof {
//     //     a: grothproof.a.clone(),
//     //     b: grothproof.b.clone(),
//     //     c: grothproof.c.clone(),
//     // };
//     // verify_proof(&pvk, &bproof, &input[1..]).expect("Verification error");
// }
