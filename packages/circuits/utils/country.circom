pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "binary.circom";

template CountryProof(n) {
  signal input lookup[n];
  signal input country; // ISO2
  signal input selectionMode; // 1 - inclusion, 0 - exclusion
  component res = IN(n * 16);
  res.value <== CountryLookup(n)(lookup);
  res.in <== country;
  res.out === 1 * selectionMode;
}

template CountryLookup(n) {
  signal input in[n];
  signal output out[n * 16];
  for (var i = 0; i < n; i++) {
    var bits[256] = Num2Bits(256)(in[i]);
    for (var j = 0; j < 16; j++) {
      out[i * 16 + j] <== Bin2Num(256, 16, j*16)(bits);
    }
  }
}

template IN (n) {
  signal input in;
  signal input value[n];
  signal output out;

  component eq[n];
  signal count[n+1];
  count[0] <== 0;

  for (var i=0; i<n; i++) {
    eq[i] = IsEqual();
    eq[i].in[0] <== in;
    eq[i].in[1] <== value[i];
    count[i+1] <== count[i] + eq[i].out;
  }

  component gt = GreaterThan(252);
  gt.in[0] <== count[n];
  gt.in[1] <== 0;

  out <== gt.out; // 1 - if in signal in the list, 0 - if it is not
}

// template GetCountryIndex() {
//   signal input in;
//   signal output out;
//
//   var n = 250;
//   var lookup[n] = [
//     4277831, // AFG
//     5914950, // ZAF
//     4279362, // ALB
//     4474197, // DEU
//     4279876, // AND
//     4278095, // AGO
//     4278593, // AIA
//     4281409, // ATA
//     4281415, // ATG
//     5456213, // SAU
//     4479553, // DZA
//     4280903, // ARG
//     4280909, // ARM
//     4276823, // ABW
//     4281683, // AUS
//     4281684, // AUT
//     4282949, // AZE
//     4343891, // BHS
//     4343890, // BHR
//     4343620, // BGD
//     4346434, // BRB
//     4343116, // BEL
//     4344922, // BLZ
//     4343118, // BEN
//     4345173, // BMU
//     4344914, // BLR
//     4345676, // BOL
//     4344136, // BIH
//     4347713, // BWA
//     4346433, // BRA
//     4346446, // BRN
//     4343634, // BGR
//     4343361, // BFA
//     4342857, // BDI
//     4346958, // BTN
//     4411478, // CPV
//     4410706, // CMR
//     4933709, // KHM
//     4407630, // CAN
//     5325140, // QAT
//     4931930, // KAZ
//     5522244, // TCD
//     4409420, // CHL
//     4409422, // CHN
//     4413776, // CYP
//     5457744, // SGP
//     4411212, // COL
//     4411213, // COM
//     4411207, // COG
//     5263947, // PRK
//     4935506, // KOR
//     4409686, // CIV
//     4411977, // CRI
//     4739670, // HRV
//     4412738, // CUB
//     4412759, // CUW
//     4476491, // DNK
//     4475465, // DJI
//     4476225, // DMA
//     4540249, // EGY
//     5459030, // SLV
//     4280901, // ARE
//     4539221, // ECU
//     4543049, // ERI
//     5461579, // SVK
//     5461582, // SVN
//     4543312, // ESP
//     5591873, // USA
//     4543316, // EST
//     4543560, // ETH
//     4606537, // FJI
//     5261388, // PHL
//     4606286, // FIN
//     4608577, // FRA
//     4669762, // GAB
//     4672834, // GMB
//     4671553, // GHA
//     4670799, // GEO
//     4671810, // GIB
//     4674116, // GRD
//     4674115, // GRC
//     4674124, // GRL
//     4672592, // GLP
//     4674893, // GUM
//     4674637, // GTM
//     4671321, // GGY
//     4674905, // GUY
//     4674886, // GUF
//     4671822, // GIN
//     4673105, // GNQ
//     4673090, // GNB
//     4740169, // HTI
//     5131332, // NLD
//     4738628, // HND
//     4737863, // HKG
//     4740430, // HUN
//     5850445, // YEM
//     4347476, // BVT
//     5391701, // REU
//     4803918, // IMN
//     5062982, // MAF
//     4738372, // HMD
//     4413522, // CXR
//     5129803, // NFK
//     4279361, // ALA
//     4413773, // CYM
//     4408139, // CCK
//     4411211, // COK
//     4607051, // FLK
//     4608591, // FRO
//     5457747, // SGS
//     5066320, // MNP
//     5064780, // MHL
//     5590345, // UMI
//     5260110, // PCN
//     5459010, // SLB
//     5522241, // TCA
//     5654866, // VIR
//     5654338, // VGB
//     4804164, // IND
//     4801614, // IDN
//     4805198, // IRN
//     4805201, // IRQ
//     4805196, // IRL
//     4805452, // ISL
//     4805458, // ISR
//     4805697, // ITA
//     4866381, // JAM
//     4870222, // JPN
//     4867417, // JEY
//     4869970, // JOR
//     4933970, // KIR
//     5786456, // XKX
//     4937556, // KWT
//     4997455, // LAO
//     5002063, // LSO
//     5002817, // LVA
//     4997710, // LBN
//     4997714, // LBR
//     4997721, // LBY
//     4999493, // LIE
//     5002325, // LTU
//     5002584, // LUX
//     5062979, // MAC
//     5065540, // MKD
//     5063751, // MDG
//     5069139, // MYS
//     5068617, // MWI
//     5063766, // MDV
//     5065801, // MLI
//     5065812, // MLT
//     5062994, // MAR
//     5067857, // MTQ
//     5068115, // MUS
//     5067348, // MRT
//     5069140, // MYT
//     5064024, // MEX
//     4608845, // FSM
//     5066586, // MOZ
//     5063745, // MDA
//     5063503, // MCO
//     5066311, // MNG
//     5066309, // MNE
//     5067602, // MSR
//     5066066, // MMR
//     5128525, // NAM
//     5132885, // NRU
//     5132364, // NPL
//     5130563, // NIC
//     5129554, // NER
//     5130049, // NGA
//     5130581, // NIU
//     5132114, // NOR
//     5129036, // NCL
//     5134924, // NZL
//     5197134, // OMN
//     5262423, // PLW
//     5259598, // PAN
//     5262919, // PNG
//     5259595, // PAK
//     5263961, // PRY
//     5260626, // PER
//     5265734, // PYF
//     5263180, // POL
//     5263945, // PRI
//     5263956, // PRT
//     4932942, // KEN
//     4933466, // KGZ
//     4670034, // GBR
//     4407622, // CAF
//     4411204, // COD
//     4476749, // DOM
//     4414021, // CZE
//     5394253, // ROM
//     5396289, // RWA
//     5395795, // RUS
//     4543304, // ESH
//     4343123, // BES
//     5722957, // WSM
//     4281165, // ASM
//     5459282, // SMR
//     5457998, // SHN
//     4997953, // LCA
//     4344909, // BLM
//     4935233, // KNA
//     5462093, // SXM
//     5460045, // SPM
//     5461072, // STP
//     5653332, // VCT
//     5457230, // SEN
//     5459013, // SLE
//     5460546, // SRB
//     5462339, // SYC
//     5462354, // SYR
//     5459789, // SOM
//     5000001, // LKA
//     5461850, // SWZ
//     5456974, // SDN
//     5460804, // SSD
//     5461829, // SWE
//     4409413, // CHE
//     5461330, // SUR
//     5458509, // SJM
//     5523521, // THA
//     5527374, // TWN
//     5524043, // TJK
//     5528129, // TZA
//     4281414, // ATF
//     4804436, // IOT
//     5264197, // PSE
//     5524563, // TLS
//     5523279, // TGO
//     5525326, // TON
//     5524300, // TKL
//     5526607, // TTO
//     5526862, // TUN
//     5524301, // TKM
//     5526866, // TUR
//     5526870, // TUV
//     5589842, // UKR
//     5588801, // UGA
//     5591641, // URY
//     5593666, // UZB
//     5657940, // VUT
//     5652820, // VAT
//     5653838, // VEN
//     5656141, // VNM
//     5721158, // WLF
//     5918018, // ZMB
//     5920581 // ZWE
//   ];
//
//   component eq[n];
//   var index = -1;
//   for (var i = 0; i < n; i++) {
//       eq[i] = IsEqual();
//       eq[i].in[0] <-- lookup[i];
//       eq[i].in[1] <-- in;
//       index += eq[i].out * (i + 2);
//   }
//
//   out <-- index;
// }
