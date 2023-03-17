use bellman::{Circuit, ConstraintSystem, SynthesisError, Variable};
use ff::{Field, PrimeField};

// proving that I know x such that x^3 + x + 5 == 35
// Generalized: x^3 + x + 5 == out
#[derive(Clone, Copy)]
pub struct CubeDemo<S: PrimeField> {
    pub x: Option<S>,
}

impl<S: PrimeField> Circuit<S> for CubeDemo<S> {
    fn synthesize<CS: ConstraintSystem<S>>(self, cs: &mut CS) -> Result<(), SynthesisError> {
        // Flattened into quadratic equations (x^3 + x + 5 == 35):
        // x * x = tmp_1
        // tmp_1 * x = y
        // y + x = tmp_2
        // tmp_2 + 5 = out
        // Resulting R1CS with w = [one, x, tmp_1, y, tmp_2, out]

        // Allocate the first private "auxiliary" variable
        let x_val = self.x;
        let x = cs.alloc(|| "x", || x_val.ok_or(SynthesisError::AssignmentMissing))?;

        // Allocate: x * x = tmp_1
        let tmp_1_val = x_val.map(|mut e| {
            e = e.square();
            e
        });
        let tmp_1 = cs.alloc(
            || "tmp_1",
            || tmp_1_val.ok_or(SynthesisError::AssignmentMissing),
        )?;
        // Enforce: x * x = tmp_1
        cs.enforce(|| "tmp_1", |lc| lc + x, |lc| lc + x, |lc| lc + tmp_1);

        // Allocate: tmp_1 * x = y
        let x_cubed_val = tmp_1_val.map(|mut e| {
            e.mul_assign(&x_val.unwrap());
            e
        });
        let x_cubed = cs.alloc(
            || "x_cubed",
            || x_cubed_val.ok_or(SynthesisError::AssignmentMissing),
        )?;
        // Enforce: tmp_1 * x = y
        cs.enforce(
            || "x_cubed",
            |lc| lc + tmp_1,
            |lc| lc + x,
            |lc| lc + x_cubed,
        );

        // Allocating the public "primary" output uses alloc_input
        let out = cs.alloc_input(
            || "out",
            || {
                let mut tmp = x_cubed_val.unwrap();
                tmp.add_assign(&x_val.unwrap());
                tmp.add_assign(&S::from_str_vartime("5").unwrap());
                Ok(tmp)
            },
        )?;

        // tmp_2 + 5 = out
        // => (tmp_2 + 5) * 1 = out
        cs.enforce(
            || "out",
            |lc| lc + x_cubed + x + (S::from_str_vartime("5").unwrap(), CS::one()),
            |lc| lc + CS::one(),
            |lc| lc + out,
        );
        // lc is an inner product of all variables with some vector of coefficients
        // bunch of variables added together with some coefficients

        // usually if mult by 1 can do more efficiently
        // x2 * x = out - x - 5

        // mult quadratic constraints
        //

        Ok(())
    }
}
