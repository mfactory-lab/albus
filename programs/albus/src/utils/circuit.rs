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

use std::collections::BTreeMap;
use std::ops::Index;

type SignalKey = String;

#[derive(Debug, PartialEq, Eq)]
pub struct SignalValue {
    pub index: usize,
    pub size: usize,
}

pub struct Signals {
    data: BTreeMap<SignalKey, SignalValue>,
    count: usize,
}

impl Index<&str> for Signals {
    type Output = SignalValue;

    fn index(&self, index: &str) -> &Self::Output {
        self.data.index(index)
    }
}

impl Signals {
    pub fn new<T: AsRef<str>, I: IntoIterator<Item = T>>(signals: I) -> Self {
        let mut count = 0;

        let data = signals
            .into_iter()
            .map(|signal| {
                let (name, size) = Self::parse_signal(signal.as_ref());
                count += size;
                (
                    name.into(),
                    SignalValue {
                        index: count - size,
                        size,
                    },
                )
            })
            .collect();

        Self { data, count }
    }

    #[inline]
    fn parse_signal(s: &str) -> (&str, usize) {
        match (s.find('['), s.find(']')) {
            (Some(open), Some(close)) if open < close => {
                let name = &s[..open];
                if let Ok(n) = s[open + 1..close].parse::<usize>() {
                    let (_, m) = Self::parse_signal(&s[close + 1..]);
                    (name, n * m)
                } else {
                    (name, 1)
                }
            }
            _ => (s, 1),
        }
    }

    // fn parse_signal(s: &str) -> (&str, usize) {
    //     let (name, rest) = s.split_once('[').unwrap_or((s, ""));
    //     let size = if let Some((n, rest)) = rest.split_once(']') {
    //         let n = n.parse::<usize>().unwrap_or(1);
    //         let (_, m) = Self::parse_signal(rest);
    //         n * m
    //     } else {
    //         1
    //     };
    //     (name, size)
    // }

    pub fn get(&self, k: &str) -> Option<&SignalValue> {
        self.data.get(k)
    }

    pub fn has(&self, k: &str) -> bool {
        self.data.contains_key(k)
    }

    pub fn len(&self) -> usize {
        self.count
    }
}

pub fn bytes_to_num(bytes: [u8; 32]) -> u64 {
    u64::from_be_bytes(bytes[24..].try_into().unwrap())
}

#[allow(dead_code)]
pub fn num_to_bytes(n: u64) -> [u8; 32] {
    let mut result = [0u8; 32];
    let u32_bytes = n.to_be_bytes();
    result[24..].copy_from_slice(&u32_bytes[..8]);
    result
}

// /// Convert unix timestamp to [u8; 32] format
// pub fn format_circuit_date(ts: i64) -> Option<[u8; 32]> {
//     let d = OffsetDateTime::from_unix_timestamp(ts).ok()?.date();
//     let n = format!("{:+}{:02}{:02}", d.year(), d.month() as u8, d.day())
//         .parse::<u32>()
//         .ok()?;
//     Some(num_to_bytes(n))
// }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_byte_conversion() {
        let n = 1697222619;
        let bytes = num_to_bytes(n);
        assert_eq!(bytes.len(), 32);
        assert_eq!(bytes_to_num(bytes), n);
    }

    // #[test]
    // fn test_sig2() {
    //     let start_time = std::time::Instant::now();
    //     let signals = Signals::new([
    //         "encryptedData[4]",
    //         "encryptedShare[3][4]",
    //         "userPublicKey[2]",
    //         "timestamp",
    //     ]);
    //     let elapsed_time = start_time.elapsed();
    //     println!("Elapsed time: {:?}", elapsed_time);
    //
    //     //     println!("{:?}", signals.get("encryptedData"));
    //     //     println!("{:?}", signals.get("encryptedShare"));
    //     //     println!("{:?}", signals.get("userPublicKey"));
    //     //     println!("{:?}", signals.get("timestamp"));
    // }

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
            "encryptedShare[3][4]",
            "threeLevel[3][4][2]",
        ]);
        assert_eq!(signals["currentDate"], SignalValue { index: 0, size: 1 });
        assert_eq!(signals["credentialRoot"], SignalValue { index: 3, size: 1 });
        assert_eq!(signals["credentialKey"], SignalValue { index: 14, size: 1 });
        assert_eq!(
            signals["issuerSignature"],
            SignalValue { index: 17, size: 3 }
        );
        assert_eq!(
            signals["encryptedShare"],
            SignalValue {
                index: 20,
                size: 12
            }
        );
        assert_eq!(
            signals["threeLevel"],
            SignalValue {
                index: 32,
                size: 24
            }
        );
        assert_eq!(56, signals.len());
    }
}

// #[test]
// fn test_format_circuit_date() {
//     let bytes = format_circuit_date(1690815541);
//     assert_eq!(
//         bytes,
//         Some([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 52, 178, 75])
//     );
// }
