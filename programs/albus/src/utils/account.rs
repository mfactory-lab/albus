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

use anchor_lang::solana_program::program_memory::sol_memcpy;
use anchor_lang::{prelude::*, solana_program::system_program};
use std::cmp;
use std::io::{self, Write};

/// Close an account
pub fn close<'info>(acc: AccountInfo<'info>, sol_destination: AccountInfo<'info>) -> Result<()> {
    // Transfer lamports from the account to the sol_destination.
    let dest_starting_lamports = sol_destination.lamports();
    **sol_destination.lamports.borrow_mut() =
        dest_starting_lamports.checked_add(acc.lamports()).unwrap();
    **acc.lamports.borrow_mut() = 0;

    acc.assign(&system_program::ID);
    acc.realloc(0, false).map_err(Into::into)
}

/// Initializes an account
pub fn initialize_account<'info>(
    payer: AccountInfo<'info>,
    target_account: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    owner: &Pubkey,
    seeds: &[&[&[u8]]],
    len: usize,
) -> Result<()> {
    let current_lamports = target_account.try_lamports()?;
    if current_lamports == 0 {
        // if account doesn't have any lamports initialize it with conventional create_account
        let lamports = Rent::get()?.minimum_balance(len);
        let cpi_accounts = anchor_lang::system_program::CreateAccount {
            from: payer,
            to: target_account,
        };
        let cpi_context = CpiContext::new(system_program, cpi_accounts);
        anchor_lang::system_program::create_account(
            cpi_context.with_signer(seeds),
            lamports,
            len.try_into().unwrap(),
            owner,
        )?;
    } else {
        // fund the account for rent exemption
        let required_lamports = Rent::get()?
            .minimum_balance(len)
            .saturating_sub(current_lamports);
        if required_lamports > 0 {
            let cpi_accounts = anchor_lang::system_program::Transfer {
                from: payer,
                to: target_account.clone(),
            };
            let cpi_context = CpiContext::new(system_program.clone(), cpi_accounts);
            anchor_lang::system_program::transfer(cpi_context, required_lamports)?;
        }
        // allocate space
        let cpi_accounts = anchor_lang::system_program::Allocate {
            account_to_allocate: target_account.clone(),
        };
        let cpi_context = CpiContext::new(system_program.clone(), cpi_accounts);
        anchor_lang::system_program::allocate(
            cpi_context.with_signer(seeds),
            len.try_into().unwrap(),
        )?;
        // assign to the program
        let cpi_accounts = anchor_lang::system_program::Assign {
            account_to_assign: target_account,
        };
        let cpi_context = anchor_lang::context::CpiContext::new(system_program, cpi_accounts);
        anchor_lang::system_program::assign(cpi_context.with_signer(seeds), owner)?;
    }
    Ok(())
}

#[derive(Debug, Default)]
pub struct BpfWriter<T> {
    inner: T,
    pos: u64,
}

impl<T> BpfWriter<T> {
    pub fn new(inner: T) -> Self {
        Self { inner, pos: 0 }
    }
}

impl Write for BpfWriter<&mut [u8]> {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        if self.pos >= self.inner.len() as u64 {
            return Ok(0);
        }

        let amt = cmp::min(
            self.inner.len().saturating_sub(self.pos as usize),
            buf.len(),
        );
        sol_memcpy(&mut self.inner[(self.pos as usize)..], buf, amt);
        self.pos += amt as u64;
        Ok(amt)
    }

    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }

    fn write_all(&mut self, buf: &[u8]) -> io::Result<()> {
        if self.write(buf)? == buf.len() {
            Ok(())
        } else {
            Err(io::Error::new(
                io::ErrorKind::WriteZero,
                "failed to write whole buffer",
            ))
        }
    }
}
