use elastic_elgamal::{app::{ChoiceParams, EncryptedChoice}, group::Ristretto,
                      DiscreteLogTable, Keypair, RingProof, RangeDecomposition, RangeProof};
use merlin::Transcript;
use rand::thread_rng;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut rng = thread_rng();

    let decomposition = RangeDecomposition::optimal(15).into();

    let mut rng = thread_rng();
    let receiver = Keypair::<Ristretto>::generate(&mut rng);

    let (ciphertext, proof) = RangeProof::new(
        receiver.public(),
        &decomposition,
        10,
        &mut Transcript::new(b"test"),
        &mut rng,
    );
    let ciphertext = ciphertext.into();

    proof
        .verify(
            receiver.public(),
            &RangeDecomposition::optimal(11).into(),
            ciphertext,
            &mut Transcript::new(b"test"),
        )
        .unwrap();

    // let (pk, sk) = Keypair::<Ristretto>::generate(&mut rng).into_tuple();
    // let choice_params = ChoiceParams::multi(pk.clone(), 5);
    //
    // let choices = [true, false, true, true, false];
    // let enc = EncryptedChoice::new(&choice_params, &choices, &mut rng);
    // let recovered_choices = enc.verify(&choice_params)?;
    //
    // let res = pk.verify_bool(recovered_choices[0], enc.range_proof())?;


    // println!("{:?}",recovered_choices);
    // println!("{:?}",recovered_choices);

    // let lookup_table = DiscreteLogTable::new(0..=1);
    // for (idx, &v) in recovered_choices.iter().enumerate() {
    //
    //     println!("{:?}", v.random_element());
    //     // assert_eq!(sk.decrypt(v, &lookup_table), Some(choices[idx] as u64));
    // }
    Ok(())
}
