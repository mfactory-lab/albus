extern crate bellman;
extern crate ff;
extern crate pairing;
extern crate rand;

use bellman::{Circuit, ConstraintSystem, SynthesisError};
use ff::{Field, PrimeField};
use pairing::{bls12_381::Bls12, CurveAffine};
use rand::thread_rng;

struct CountryVerification {
    country: Option<String>,
}

impl Circuit<Bls12> for CountryVerification {
    fn synthesize<CS: ConstraintSystem<Bls12>>(self, cs: &mut CS) -> Result<(), SynthesisError> {
        let mut europe_flags = vec![];
        for (i, country) in EUROPEAN_COUNTRIES.iter().enumerate() {
            let flag_var = cs.alloc(
                || format!("europe_flag_{}", i),
                || {
                    if self.country.as_ref().map(|s| s == country).unwrap_or(false) {
                        Ok(Bls12::Fr::one())
                    } else {
                        Ok(Bls12::Fr::zero())
                    }
                },
            )?;
            europe_flags.push(flag_var);
        }
        cs.enforce(
            || "only_one_country_can_be_european",
            |lc| lc + europe_flags.iter().map(|f| *f),
            |lc| lc + CS::one(),
            |lc| lc + CS::one(),
        );
        Ok(())
    }

    fn blank_instance(_: &str) -> Self {
        CountryVerification { country: None }
    }
}

// List of European countries
const EUROPEAN_COUNTRIES: [&str; 50] = [
    "Albania",
    "Andorra",
    "Austria",
    "Belarus",
    "Belgium",
    "Bosnia and Herzegovina",
    "Bulgaria",
    "Croatia",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "Ireland",
    "Italy",
    "Kosovo",
    "Latvia",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Moldova",
    "Monaco",
    "Montenegro",
    "Netherlands",
    "North Macedonia",
    "Norway",
    "Poland",
    "Portugal",
    "Romania",
    "Russia",
    "San Marino",
    "Serbia",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland",
    "Ukraine",
    "United Kingdom",
    "Vatican City",
];
