use bellman::{Circuit, ConstraintSystem, SynthesisError};
use ff::{Field, PrimeField};

// Define a circuit to verify if a country is in Europe
struct EuropeVerifier<F: Field> {
    country: Option<F>,
    is_europe: Option<F>,
}

impl<F: PrimeField> Circuit<F> for EuropeVerifier<F> {
    fn synthesize<CS: ConstraintSystem<F>>(self, cs: &mut CS) -> Result<(), SynthesisError> {
        // Allocate variables for the input and output
        let country_var = cs.alloc(
            || "country",
            || {
                self.country
                    .ok_or_else(|| SynthesisError::AssignmentMissing)
            },
        )?;
        let is_europe_var = cs.alloc(
            || "is_europe",
            || {
                self.is_europe
                    .ok_or_else(|| SynthesisError::AssignmentMissing)
            },
        )?;

        // Define constraints for the circuit
        let europe_codes = vec![
            40, 56, 100, 191, 203, 208, 233, 246, 348, 352, 372, 428, 440, 442, 470, 498, 528, 578,
            616, 620, 642, 703, 705, 724, 752, 756, 826, 831, 832, 833, 834, 840, 858, 860, 876,
            894,
        ];
        // self.country
        //     .ok_or_else(|| SynthesisError::AssignmentMissing)
        // europe_codes.contains()

        // let is_europe_lc = cs.linear_combination::<F>(europe_codes.iter().map(|&code| {
        //     let is_country_code = cs.alloc(
        //         || format!("is_country_{}", code),
        //         || {
        //             if self.country == Some(code) {
        //                 Ok(F::one())
        //             } else {
        //                 Ok(F::zero())
        //             }
        //         },
        //     )?;
        //
        //     (is_country_code, F::one())
        // }));

        // Ensure that is_europe_var is equal to 1 if the input country is in Europe, and 0 otherwise
        // cs.constrain(is_europe_var - is_europe_lc);

        Ok(())
    }
}
