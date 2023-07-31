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

pub mod assert;
// pub mod nft;

pub use assert::*;
use std::borrow::Cow;
use std::collections::BTreeMap;
use std::ops::Index;
use time::OffsetDateTime;

// (index, size)
type Signal = (usize, usize);

pub struct Signals<'a> {
    data: BTreeMap<Cow<'a, str>, Signal>,
    count: usize,
}

impl<'a, Idx: Into<Cow<'a, str>>> Index<Idx> for Signals<'a> {
    type Output = Signal;

    fn index(&self, index: Idx) -> &Self::Output {
        self.data.index(&index.into())
    }
}

impl<'a> Signals<'a> {
    pub fn new<T>(signals: impl IntoIterator<Item = T>) -> Self
    where
        T: Into<Cow<'a, str>>,
    {
        let mut data = BTreeMap::new();
        let mut count = 0;

        for signal in signals {
            let (name, len) = {
                let s: Cow<str> = signal.into();
                match (s.find('['), s.rfind(']')) {
                    (Some(open), Some(close)) if open < close => {
                        let name = s[..open].to_owned();
                        if let Ok(n) = s[open + 1..close].parse::<usize>() {
                            (name.into(), n)
                        } else {
                            (name.into(), 1)
                        }
                    }
                    _ => (s, 1),
                }
            };
            data.insert(name, (count, len));
            count += len;
        }

        Self { data, count }
    }

    pub fn get(&self, k: impl Into<Cow<'a, str>>) -> Option<&Signal> {
        self.data.get(&k.into())
    }

    pub fn has(&self, k: impl Into<Cow<'a, str>>) -> bool {
        self.data.contains_key(&k.into())
    }

    pub fn len(&self) -> usize {
        self.count
    }
}

/// Convert unix timestamp to [u8; 32] format
pub fn format_circuit_date(ts: i64) -> Option<[u8; 32]> {
    let d = OffsetDateTime::from_unix_timestamp(ts).ok()?.date();
    let n = format!("{:+}{:02}{:02}", d.year(), d.month() as u8, d.day())
        .parse::<u32>()
        .ok()?;
    Some(num_to_bytes(n))
}

pub fn num_to_bytes(n: u32) -> [u8; 32] {
    let mut result = [0u8; 32];
    let u32_bytes = n.to_be_bytes();
    result[28..].copy_from_slice(&u32_bytes[..4]);
    result
}

#[test]
fn test_signals() {
    let signals = Signals::new([
        "currentDate",
        "minAge",
        "maxAge",
        "credentialRoot",
        "credentialProof[10]",
        "credentialKey",
        "issuerPk[2]",
        "issuerSignature[3]",
    ]);
    assert_eq!(signals["credentialRoot"], (3, 1));
    assert_eq!(signals["credentialKey"], (14, 1));
    assert_eq!(signals["issuerSignature"], (17, 3));
    assert_eq!(20, signals.len());
}

#[test]
fn test_format_circuit_date() {
    let bytes = format_circuit_date(1690815541);
    assert_eq!(
        bytes,
        Some([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            52, 178, 75
        ])
    );
}
