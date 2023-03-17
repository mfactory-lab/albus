use anyhow::Result;
use ark_bn254::Bn254;
use ark_circom::{CircomBuilder, CircomCircuit, CircomConfig};
use ark_ec::PairingEngine;
use ark_groth16::{
    create_random_proof, generate_random_parameters, prepare_verifying_key, verify_proof, Proof,
    ProvingKey, VerifyingKey,
};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};

/// Load circuit file `name` and initialize [CircomConfig]
pub fn load_circuit<E: PairingEngine>(circuits_path: &str, name: &str) -> CircomBuilder<E> {
    let wtns = format!("{}/{}.wasm", circuits_path, name);
    let r1cs = format!("{}/{}.r1cs", circuits_path, name);

    CircomBuilder::new(
        CircomConfig::<E>::new(wtns, r1cs).expect("Failed to initialize `CircomConfig`"),
    )
}

pub fn trusted_setup(&self) {
    let name = "linear";
    let mut builder = self.load_circuit::<Bn254>(name);
    // builder.push_input("currentDate", 2023);
    // builder.push_input("currentDate", 3);
    // builder.push_input("currentDate", 8);
    // builder.push_input("birthDate", 2002);
    // builder.push_input("birthDate", 3);
    // builder.push_input("birthDate", 9);
    // builder.push_input("minAge", 18);
    // builder.push_input("maxAge", 20);
    // builder.push_input("country", 876);

    let params = self.generate_setup(builder.setup());
    // let proof_bytes = generate_proof(builder.clone().build().unwrap(), params.as_slice());
    // verify(builder.build().unwrap(), proof_bytes.as_slice(), &params);
}

/// Generate new trusted setup from the [circuit]
pub fn generate_setup<E: PairingEngine>(&self, circuit: CircomCircuit<E>) -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let params = generate_random_parameters::<E, _, _>(circuit, &mut rng).unwrap();

    let mut bytes = vec![];
    params
        .serialize(&mut bytes)
        .expect("Failed to serialize proving key");
    bytes
}

pub fn generate_proof<E: PairingEngine>(circuit: CircomCircuit<E>, pk_bytes: &[u8]) -> Vec<u8> {
    let pk = ProvingKey::<E>::deserialize(pk_bytes).expect("Failed to deserialize `ProvingKey`");
    let proof = create_random_proof::<E, _, _>(circuit, &pk, &mut rand::thread_rng()).unwrap();
    let mut bytes = vec![];
    proof.serialize(&mut bytes).unwrap();
    bytes
}

pub fn verify<E: PairingEngine>(circuit: CircomCircuit<E>, proof_bytes: &[u8], vk_bytes: &[u8]) {
    let vk = VerifyingKey::<E>::deserialize(vk_bytes).expect("Failed to deserialize vk");
    let pvk = prepare_verifying_key(&vk);
    let proof = Proof::<E>::deserialize(proof_bytes).expect("Failed to deserialize proof");

    let inputs = circuit.get_public_inputs().unwrap_or_default();
    println!("inputs: {:?}", inputs);

    let verified = verify_proof(&pvk, &proof, &inputs).unwrap();
    assert!(verified);
}
