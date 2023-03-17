use bellman::{
    groth16::{
        create_random_proof, generate_random_parameters, prepare_verifying_key, verify_proof,
    },
    Circuit, ConstraintSystem, SynthesisError, Variable,
};
use bls12_381::Bls12;
use ff::{Field, PrimeField};
use rand::thread_rng;

// Define a struct for the age verification circuit
pub struct AgeVerification<F: PrimeField> {
    pub(crate) birth_year: Option<F>,
}

fn date_to_days(year: u32, month: u8, day: u8) -> u32 {
    // Calculate the number of days in each month
    let days_in_month = [
        31, // January
        28, // February
        31, // March
        30, // April
        31, // May
        30, // June
        31, // July
        31, // August
        30, // September
        31, // October
        30, // November
        31, // December
    ];

    // Calculate the number of days in the years before the given year
    let mut days = (year - 1) * 365 + (year - 1) / 4 - (year - 1) / 100 + (year - 1) / 400;

    // Add the number of days in the months before the given month
    for m in 1..month {
        days += days_in_month[m as usize - 1];
    }

    // Add the number of days in the given month
    days += day as u32;

    // Adjust for leap years
    // if month <= 2 && (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
    //     days -= 1;
    // }

    days
}

#[test]
fn aaa() {
    let a = date_to_days(2023, 3, 6);
    let b = date_to_days(2002, 3, 9);
    println!("{}", (a - b));
    println!("{}", (a - b) / 365);
}

// Implement the Circuit trait for the AgeVerification circuit
impl<F: PrimeField> Circuit<F> for AgeVerification<F> {
    fn synthesize<CS: ConstraintSystem<F>>(self, cs: &mut CS) -> Result<(), SynthesisError> {
        // TODO:
        let current_year = 2023u64;
        let min_age = 18u64;

        // Allocate inputs for the birth year and the current year
        let current_year_input =
            cs.alloc_input(|| "current_year_input", || Ok(F::from(current_year)))?;

        let birth_year_input = cs.alloc_input(
            || "birth_year_input",
            || self.birth_year.ok_or(SynthesisError::AssignmentMissing),
        )?;

        // Ensure that the birth year is less than or equal to the current year
        cs.enforce(
            || "birth_year <= current_year",
            |lc| lc + birth_year_input,
            |lc| lc + CS::one(),
            |lc| lc + current_year_input,
        );

        // Calculate the age of the person
        let age = cs.alloc(
            || "age",
            || match self.birth_year {
                Some(birth_year) => Ok(F::from(current_year) - birth_year),
                None => Err(SynthesisError::AssignmentMissing),
            },
        )?;

        // Ensure that the age is greater than or equal to 18
        let age_threshold = cs.alloc(|| "age_threshold", || Ok(F::from(min_age)))?;

        cs.enforce(
            || "age >= 18",
            |lc| lc + age,
            |lc| lc + CS::one(),
            |lc| lc + age_threshold,
        );

        Ok(())
    }
}

// Define a struct to represent our circuit
pub struct MyCircuit {
    num: Option<u64>,
}

// Implement the Circuit trait for our struct
impl Circuit<bls12_381::Scalar> for MyCircuit {
    fn synthesize<CS: ConstraintSystem<bls12_381::Scalar>>(
        self,
        cs: &mut CS,
    ) -> Result<(), SynthesisError> {
        // Allocate the input variable
        let num = cs.alloc_input(
            || "num",
            || Ok(bls12_381::Scalar::from(self.num.unwrap_or(0))),
        )?;

        // Add the constraint that num >= 18
        let eighteen = bls12_381::Scalar::from(18u64);

        // Ensure that the age is greater than or equal to 18
        let age_threshold = cs.alloc(|| "age_threshold", || Ok(eighteen))?;

        cs.enforce(
            || "num >= 18",
            |lc| lc + num,
            |lc| lc + CS::one(),
            |lc| lc + age_threshold,
        );

        Ok(())
    }
}

#[test]
fn test1() {
    let rng = &mut thread_rng();

    // Generate a random set of proving parameters using the circuit
    let params = generate_random_parameters::<Bls12, _, _>(MyCircuit { num: None }, rng).unwrap();

    // Prepare the verifying key
    let vk = prepare_verifying_key(&params.vk);

    // Initialize a new instance of our circuit with input num = 25
    let circuit = MyCircuit { num: Some(25) };

    // Create a proof of our circuit with the given input value
    let inputs = vec![bls12_381::Scalar::from(25u64)];
    let proof = create_random_proof(circuit, &params, rng).unwrap();

    println!("{:?}", proof);

    verify_proof(&vk, &proof, &inputs).unwrap();
}
