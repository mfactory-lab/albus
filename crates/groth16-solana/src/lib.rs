/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

use solana_program::alt_bn128::prelude::{
    alt_bn128_addition, alt_bn128_multiplication, alt_bn128_pairing, AltBn128Error,
    ALT_BN128_FIELD_SIZE,
};

const G1_SIZE: usize = ALT_BN128_FIELD_SIZE * 2;
const G2_SIZE: usize = ALT_BN128_FIELD_SIZE * 4;

pub type F = [u8; ALT_BN128_FIELD_SIZE];
pub type G1 = [u8; G1_SIZE];
pub type G2 = [u8; G2_SIZE];

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Groth16Error {
    AltBn128Error(AltBn128Error),
    InvalidProof,
    InvalidPublicInputs,
    VerificationFailed,
}

#[derive(PartialEq, Eq, Debug)]
pub struct VK<'a> {
    pub alpha: G1,
    pub beta: G2,
    pub gamma: G2,
    pub delta: G2,
    pub ic: &'a [G1],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Proof {
    a: G1,
    b: G2,
    c: G1,
}

impl Proof {
    pub fn new(a: G1, b: G2, c: G1) -> Self {
        Self { a, b, c }
    }
}

impl From<(G1, G2, G1)> for Proof {
    fn from(value: (G1, G2, G1)) -> Self {
        Self::new(value.0, value.1, value.2)
    }
}

impl Proof {
    fn validate(&self) -> Result<(), Groth16Error> {
        if self.a.len() != G1_SIZE || self.b.len() != G2_SIZE || self.c.len() != G1_SIZE {
            Err(Groth16Error::InvalidProof)
        } else {
            Ok(())
        }
    }
}

#[derive(PartialEq, Eq, Debug)]
pub struct Groth16Verifier<'a> {
    proof: &'a Proof,
    public_inputs: &'a [[u8; ALT_BN128_FIELD_SIZE]],
    vk: &'a VK<'a>,
}

impl<'a> Groth16Verifier<'a> {
    pub fn new(proof: &'a Proof, public_inputs: &'a [F], vk: &'a VK) -> Result<Self, Groth16Error> {
        proof.validate()?;

        if public_inputs.len() + 1 != vk.ic.len() {
            return Err(Groth16Error::InvalidPublicInputs);
        }

        Ok(Self {
            proof,
            public_inputs,
            vk,
        })
    }

    pub fn verify(&self) -> Result<bool, Groth16Error> {
        let mut acc = self.vk.ic[0];
        let mut input = Vec::with_capacity(G1_SIZE + ALT_BN128_FIELD_SIZE);

        for (i, ic) in self.public_inputs.iter().zip(self.vk.ic.iter().skip(1)) {
            input.clear();
            input.extend_from_slice(ic);
            input.extend_from_slice(i);

            let mut mul_res =
                alt_bn128_multiplication(&input).map_err(Groth16Error::AltBn128Error)?;

            mul_res.extend_from_slice(&acc);

            acc = alt_bn128_addition(&mul_res)
                .map_err(Groth16Error::AltBn128Error)?
                .try_into()
                .expect("conversion failed");
        }

        let mut input = Vec::with_capacity(G1_SIZE * 4 + G2_SIZE * 4);
        input.extend_from_slice(self.proof.a.as_slice());
        input.extend_from_slice(self.proof.b.as_slice());
        input.extend_from_slice(acc.as_slice());
        input.extend_from_slice(self.vk.gamma.as_slice());
        input.extend_from_slice(self.proof.c.as_slice());
        input.extend_from_slice(self.vk.delta.as_slice());
        input.extend_from_slice(self.vk.alpha.as_slice());
        input.extend_from_slice(self.vk.beta.as_slice());

        let res = alt_bn128_pairing(input.as_slice()).map_err(Groth16Error::AltBn128Error)?;

        if res[31] != 1 {
            return Err(Groth16Error::VerificationFailed);
        }

        Ok(true)
    }
}
