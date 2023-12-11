pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";

template CountryIndexLookup() {
  signal input in;
  signal output out;

  var n = 250;
  component eq[n];

  var lookup[n] = [
    0x15ff8b91324570b2e4a2d789bb9a3563b9d83ef7c212cd6bb6dd57a76079f98b, // AFG
    0x08db1b7bd170b9f8dcd4bb91a73a5ca769d22d41bc0912c759f56684b8a0a14f, // ZAF
    0x12b73f4d3d5dec3fb416920b9fab49c88a2d5049641a5adc43f21999bffe97d1, // ALB
    0x2807072559b54ad0d07b0e4f92bb226ead0bed8b813d96762a982bfbb157affb, // DEU
    0x22b18feb831ffaa77e10d58cfe24d451ccf276bee63de278a027a769d20eac3d, // AND
    0x0e5feb91f104fa2bc0363639d1d0c87d04122b5d2e9bb647851dc44ba67b2058, // AGO
    0x1702029bbc74240c85e0bb3813ea35123781c329072ed0f31d592c9dfa54c180, // AIA
    0x04d7b64b444869765983bf435dd3dccdb3ae7de48cf717b7306b6afd4f8471fd, // ATA
    0x1e0a853e31afc3680e58def994867e7309674e02807c2782099986b3a82bad06, // ATG
    0x2b967f1fc12eb7239a49c934593dd191268ff73a3c7f2a3927373ddd53986dd0, // SAU
    0x1155f48632b73644c28da0c925a08746542a80bcd4f78bbb5e8c1eba6729db1c, // DZA
    0x2a23db6cb10d2e64df6175cf4f57ecabda0268e4116b23570817cfe3fda782fd, // ARG
    0x2e82499495022feb8340255af885b35474bcebeb425edff777d5124f9aa3fbd1, // ARM
    0x2e537313504e6fe3f7f5d1e4155183e607af4eeda530d521244d05bbed8b90ec, // ABW
    0x3057936b34b4816129183868347c0688aa40bb13cf6816bcf7d7e8022355e7db, // AUS
    0x213e15a493ece1c4c361a129f00eb4a99faf37daa6ecc5cff2262669ebeeb6cc, // AUT
    0x25a5bf5104eef32f5f79d1f1b09dd3fb559b785f7fb519a3ac046fe5408894b0, // AZE
    0x17e0eb6bade4aadefdd7df5b4a96d9e9492474c60838d77fa2aeca0c3a57dab5, // BHS
    0x09523c3c165dea910a6669320351bafaae0a8191b98cf2e4584612a0e43b0963, // BHR
    0x241273959853d14c8d4b30d2fdf402c1e9dffda62b2bbb2b95982df3f4e06d35, // BGD
    0x0a923cc647233dcd95f9f0943df95d39aedb1272ea14db954212ca8459eebf3d, // BRB
    0x1a6b25802835ea241a008f04cb04bd516e55f207d134c00ba29aec5c4bc075e8, // BEL
    0x2f2d6b779e2c2604bac587e35c07bc911ff3fd326ddee77969e3a05a8c84cc9a, // BLZ
    0x13a31d67ba21e6eac48509942814b9b74d47d2a7a2e76cf5342fc762f07bd10f, // BEN
    0x199479b945090e8d0b649eae1387ea98079c2707c468432ebd9d683d88267508, // BMU
    0x013610e03b72bf56cd6b7b5516c21068c6bcaa2fd4d96fd9944f16ac4f0f318d, // BLR
    0x1ae7f45da66efa8bfec169899455ed726d4246db48f9bfe09cd2868f194e2776, // BOL
    0x100d4a74aae0153277f0fe2621f82416a0886f9c97c026f62820b8af9e4ec529, // BIH
    0x24ed77aa0db64e3d5f45be58b1b07eeb05bf320edb4762174a0d00d335715f53, // BWA
    0x079b83789812c70054affae85b3d15e09ad0859e6d1d69a7bc450a0ade282ea3, // BRA
    0x010b462f3223a999e66c247279ac024c27df2308fea30bdcae0b8555c32dcb49, // BRN
    0x24f6f16acc3604fabed613eca204558025437a2674724e471445c7bed3219436, // BGR
    0x1297ad62c8be66c421e04f5fd38d5b655692c82887195580e859b58856eaa9e9, // BFA
    0x1b03698de54c697cd3da0f2adb8605edf02b0761a6e076f0311f36375fb16fa7, // BDI
    0x1417569af3770bf311182738ffe7f0b20eedaefd6a21db6c8d1b5e8dea4cd217, // BTN
    0x1248a4e894bb9705af4626bee02780e68c753cfd7c21110ea8a4d40f11558941, // CPV
    0x2067f672545e10bd31f94f7ad9152a97e2c234a014f17af54af83004d47fa48c, // CMR
    0x1bcf66687f85855cd5ea9d727ccbade9120c6fcb8a76063ac302db1839659802, // KHM
    0x19ed583ad06e85e961392b2784e93753970188128e1daf357bbce7127e3a5834, // CAN
    0x08709f7c43215a4194ff92ccc0db5a771cc48f9ee3b10a0bbdbfb2aeb3cc025e, // QAT
    0x202ce2d88903182a02ae5ac48cc82d09f85b93a92432d9eb015082e4b61e7e8f, // KAZ
    0x12d552bb4451d2e54a8346fb72dca1f55cb52e9d7b8a5a7af4d69d9651d1972a, // TCD
    0x07c8ea9d078e1dda6518043ebec5a2453f19c5d185db9830b7b400b00fed8359, // CHL
    0x2a53ec9e429e8bf72d42eee49ab4100e79fbb82042fdaa657b3df83119e36f35, // CHN
    0x2b1ee28de361b5c9ddc4be90a9b25a65be6b1cca4505e99771f38ac2303f5267, // CYP
    0x2abd33b0888f20ec039ed79c62ffccf205434be16821ac6e64affa9503eb92eb, // SGP
    0x024e4a46957c1fa18fcc06b6e42eb171e959ff863fc04df60c46ea7c4918a61a, // COL
    0x2b41a491c8e2536868c995091321b89a4acf659d106a8a7673d6483aa156f910, // COM
    0x0eaae4bbf3d4aaec61507f72325062409f708eed6d232faa70424995850b5cc0, // COG
    0x22e6d847286da8baaa184c137c8d1b4c4a69c57681d4917b5f867e35411d3ec1, // PRK
    0x082bd255c896ee6fffa25747f2ad6cef0d2101a96dfd88415006184d3da631af, // KOR
    0x08ee16e3f47805985e283ff7f4fe5a2c6f20d661dd46e198a15dedb4d197ccb0, // CIV
    0x0eb195784b6188e7cc4a46c2ff60a2edabba41fcccb5a3c2641cd7eb4187e338, // CRI
    0x10de3e22a75dd14bdd35b8b95816c893892711b3e71f82a076672d44e0339113, // HRV
    0x2a168f85bb6021164c2aefba84a5f04ddce870b8dca2a39343df3577513c4c75, // CUB
    0x0b9eb62e407f31d55275dd0d891fdf99c152b84f60dc964cd350b5438e361ea4, // CUW
    0x1d41db1854037493b306c80c93eeb63d9d231282c5114083a3248320d67e491d, // DNK
    0x1c12b067ac5025f526b95f4307f2a2a0111397f2648aac5904db928a2317e01e, // DJI
    0x0197d7c0b6d7451b665050e22868323f863d53ca5133b39ff220a43270cff7a8, // DMA
    0x2296688de9c1f1b7228c5c43a1ae7ba418bb2ccd5d74a4266551c49977daef40, // EGY
    0x1e6c3f1de598d92d633ee8a2e0f475d88b9cec3df1ea7c8fe6aad2dcd52253d4, // SLV
    0x0b81318b3aa7161180902c4c75d578420df6f87a563e81ba6fd98350fc79b321, // ARE
    0x271fdc27f8826c83281cb1f78c4eca8420959afeec856ddc47b9212c64ed07b4, // ECU
    0x0b04be3cd2fce1f7cca952db71dd6e8cef24b11605a1333dce375c51f8aafa4d, // ERI
    0x282dc9081c3b1afe6116d92a7bfcf0dc1c0bcc97db351969ab7612c25ad08ea5, // SVK
    0x15376946c0bb7acd0023c8f7445871552f720d33c0e89f2e8162c66b0b4770fb, // SVN
    0x0473adb7ea863f9ac77eb40def09c380f08e3b0c6bec19e44688db8b44a16e81, // ESP
    0x08e3cd992e129ea9bba0d5df8ee2b67f6b1f521c444af74f70942756138d1763, // USA
    0x080037b374542cf431f26256cb124d673e005e0f3330eaf76e04d6c8ec9d8ab6, // EST
    0x285e0bae3914eb6c75660708498f18e996716293722b6b0b4bd580a1500a03a0, // ETH
    0x1e5f0f7f89a4c8e56d0d5724933706aa51451e655e248a51926e55d729987e61, // FJI
    0x0fc5ac5509ebe394417951ec9335e48042b62ae25fb9c0813fa7b4e31471f981, // PHL
    0x250b7cd7594e05b47361c1b6f680455658fd06bf6174ba9a70e4df07c75444aa, // FIN
    0x073217ab145927968d28c3eb951d2c744f39cf06dbe1b022f1bcaffcea0a95a7, // FRA
    0x2f26d22968b98661694c889d632a06d032d08291ba051fccb9655afac416dfb5, // GAB
    0x03aac936e7772fa380ea7a137015043c8481f1af288d1060e2f1463f4ba097c6, // GMB
    0x240f613d37999a9bcdf0f7b78f16c45909de103c63319d3a700c14147f2b3dcb, // GHA
    0x1e0979e51f46b1108458e7df89eb6bdd97f5c082e4b5a78183d1138fba03597f, // GEO
    0x1d7aa539b079da63c5c2ceea11796ea6666a5fcc54cf7194649e1befb5389e9d, // GIB
    0x06bb9c98cd4e8a76a3331e8841c31dab3574ac4b7c7eca367fed0821cc773d56, // GRD
    0x18206d6d8a4ee79e176dbc3521ac163281a2258f5b4c7c5dd387d27ce2595622, // GRC
    0x16826980dfed1603437face67cc1bffecdfb00400a3c68e2c1e55f86cf9e733a, // GRL
    0x1d81f1fea1bbd2dd30224a99926e6a39063fd43b2d616268adf7b9e538b1daa7, // GLP
    0x221aec504100c8e080ba04e6824ced85901d91f0105c88fcd6c666e7f8a21229, // GUM
    0x058fa7f53185a3a79a45454d8725c7dd9d8d341dfac27bce516cb52b2ec8605c, // GTM
    0x2578ac83efc3240a58ff90909e86b14a3af12626b72ee80240d7c11d23201f9f, // GGY
    0x29832057de9ee67e8ece3c9718f17be646b7b972dc01171a527f47c31554b3be, // GUY
    0x045b783bf0c00954e69984d6cb28dd49f92802d5629bb18e82d1b4e344125546, // GUF
    0x072774fb509ec898d8303bd0ac82799bb88a832854c3042dfb7392c6daa7b66a, // GIN
    0x0fe84f75256ee9138d1d077383ad6e9af9c1ae795f9d071354feb54999e56ef1, // GNQ
    0x06807206b503f42c1cff763b5f2d4880d134cd92f89d597b85caf37ab38cb826, // GNB
    0x25fa7d5f2c2630ae7cee1ebe0e9660ad7515d8d45733aad49f9b3179bb510332, // HTI
    0x0b837497b849aa2c041e44526f68c9fdc65eb8a4ce37ed6678fe17684e299a48, // NLD
    0x091cafec5981120c884648debff20ece5a372b4f50cbb3d61986f6e6b5e1f325, // HND
    0x0a1d941381406f5c4823fba50b97c11a45dd2b88f75ee3a80a5660dc6b492b43, // HKG
    0x081e25fc33fa9715191500666e6f7af5e62553c0385abcd1f1e2fbd16e8ee56a, // HUN
    0x1d6b7c17804c9700bcd7f74ae8418798b05a5dbbf3842f4a8d7642837f3726b9, // YEM
    0x2cc2d60f1d52978b4a1e61e7c86d274bd4f897a9c5710701cb843c976996ed86, // BVT
    0x01e76c6bfce1af896f6017064d3b714fa74dfc204298341d1be68941ac46fdac, // REU
    0x24a465bcc62133606d3f22cd7196e2fd7b3f4fac3366e32a2fec0a2c643069c3, // IMN
    0x2206737b4113e630e938dca863edb6ffda942fc0dff154bb0d42d0e505615e9d, // MAF
    0x13b71b55feca030b03d0ddffeb39a6116890761b6dcec074e6b74742806d68d5, // HMD
    0x2c470420fdab2c0d5ebbdf223dda0c2082bf80e21994a126a2e1061b6279d606, // CXR
    0x12134ed46d6437fe86588a33348c8654f6b540fcb5761868f7866b8efdcb6722, // NFK
    0x23c6bfcf8b8d5e202e1d74cc5bb984525e5661081dd292484d5b697f09e3fb2f, // ALA
    0x15ffaac3a20c3ac027d9b20a0edd53cd0d8fda137a69b7b8be594b2fa952d84b, // CYM
    0x18054d94333faf483bbe2efb853844fd7faac67ce775c4d5bf7780c32d1ec19a, // CCK
    0x0699d48bec23890d9226ee7bb09f03d35ee784c008cf8b6d85fd3fc4b05ddc12, // COK
    0x07c4eb6004cefc074d56845955df3c117d1574d7b24d728015c66dd178075047, // FLK
    0x031de60b5a727d19f9a367d6e9c42c8cae153b091604a1a03a97fcea7216ec0a, // FRO
    0x23cbbfb1562e4a1a4ae3fed0b7887016e063a9fa744991597472c57ce554d373, // SGS
    0x1aefbfade81f4a78af5ebbad4d12f777d86bad74ce791113775bcc9cadb51f80, // MNP
    0x1d78c4b4e91714c68beda31065322252462bc9b7fd42aca74d8b9372696bfd6f, // MHL
    0x1a5079052f46b2406a3cb195ee4616643c99bd7bec3cddce9826a66441c4d8b0, // UMI
    0x160fb29dad7eb0afa41810c8f3aa70e0e4fcda1799d439cd717f77bbe33c987a, // PCN
    0x0e2fa2a18b72b6c614891854bfa734ed78c6f39327709d4458f0267c2691e97b, // SLB
    0x0cfc564392ba6f68c01d1f8d806778d3e974dae39cf7d0560fe58e59659e732d, // TCA
    0x153145311b9fbb3c02eb9e43ce23cfbde891379bb6e30b8a3efc23743c3e3f6c, // VIR
    0x2f9da57ffe6249f460d2dcb0a14f4404026b823e21d2a61be4817a586708699f, // VGB
    0x292355a79956454feab5b42a45a3c2dfd370839d125c4d2e143815dc8a075b7a, // IND
    0x200bb02705ce71d03e16d876ec1322c0ba3076418da7c4806ddb43db5b473eef, // IDN
    0x037dda060d1eff3926eda307ed0ba465bf0e1cd8283321375ed3eac374c62ca1, // IRN
    0x03e56ecdea10a75bbec095cb0c99ede1eed0087b19caf03f1f2874e469a444d4, // IRQ
    0x1e21fe9975ea79e5c9f2131bb2dd0d3efd140d668f064509f829c7322e32e531, // IRL
    0x1026fc5f3afc77405cade10742580246357456ffab9d3c550325dca6367e8c57, // ISL
    0x16364c8d768d61c4e85beff1b34e70d53e6ff6dc1dbc905ae7d48ac038b19558, // ISR
    0x1bb4d5e50446fb096e8bc17e5aff28275588e42e3934a1c3f3dcde7be518eb3d, // ITA
    0x12c0a7869895249e0b9e21983799be7dc36abba0d8d1411557de25b608033f16, // JAM
    0x1f5c20ae335e8de05b75f6537c227092be84154b54ee3e9d4a389ed0d85a6625, // JPN
    0x08bf519dcd4bc92e53680f1b4973205947fcebb16db0fba762159fbcde0e52ae, // JEY
    0x23a8cb47a9b3360807994ca990a0a5fd2e62cb9d96ea07e7d272d670f24a1ac1, // JOR
    0x247556332b66fcc5b10e3258119da61af37fda174eac112564fc87da93da58aa, // KIR
    0x27023af780aab6e3ac6fe4e4aa5d276019fc83aef4a9265ce023495dfa50603e, // XKX
    0x22973e2e0df59ee77077e7a6d7847ac10dbb2bfb5a91579644781a5601e77886, // KWT
    0x22dee132251c82ce1b3767456316618148c09b3db92b688d09623f391743e243, // LAO
    0x072b8037dada5b74223519f08e64c4e4a6382d106f8649c1a844522b762f46d7, // LSO
    0x0a5a6ae0b307b28c925a1e4397cc5e86687c47abca7c366e1b0a96dcfc2d08e2, // LVA
    0x1f753d663e72531f58e954ddceb3c40bd8289f6512e460ac8336f20456c7e808, // LBN
    0x1d2a55b12c172ba4997a3236f70139f27e1ea0571a5257bf0f7efd349e2bf942, // LBR
    0x114c3d14180f14503808d42de96b4e0ca636b653a8f567d7f1700d1d696c2819, // LBY
    0x0b82a544e0febd80348f2dcecd6ab23cb1376e35a3c9d96b2acc7011005e5ba6, // LIE
    0x1fad55e576774737d6ce876b9642f8920d66a27a475e58de3cdeae590665a83e, // LTU
    0x1c2f77cc65ad0392def4fc48751451f9569bb867670a95d1bbc2428c68dfd5f1, // LUX
    0x1ca6aacbe3da291438e83890b5e41c0cfe25b2e8de4cdacae2f6396bbb255cdc, // MAC
    0x199ca43843a33b0f6006925eeb15e7871f4341652038b56eae98454d73067dc9, // MKD
    0x20891db2a97463baf450119830d961410f9abb41827024582f89d78612be71ea, // MDG
    0x1b450ab3ae23396dc743ba5fd30c3afaa88bfb1c13b6d98d43790f3c8df39a85, // MYS
    0x0222cca532d555b3283a03253a4d4bcb6b626f2b7b24fc1ca73f3b8d04374ce1, // MWI
    0x2c00f5a4f0537cf8b9fa1d13cb3c96ee3df31530137a6186bf45b2b6389386e1, // MDV
    0x0cafa6a6411e5f452888c91c6b3405ebe9b4cf9f0f888b4513461e3382449c43, // MLI
    0x239fe8c4a65de684b99a1f1ded9ea596c042c24acc81a876c263e2f8d33048e3, // MLT
    0x1b25ad7a1c1dd77da86f5c847961f7e829468f2a0c88859e538e5c1328208485, // MAR
    0x02bc01718dcd0a69d7c9dc5530c173d0aa11d3db20843a06ed652a27a8e46aa1, // MTQ
    0x17a60660819016112c109bb76c5b80eb99ef500b8186ec6e4e0a512d56a4d693, // MUS
    0x301f30aba763f1245077975b211d10ad9b9ab80a0498725953a3d8f9c84fc9ce, // MRT
    0x28a5a3b5dccce2add3fe1c178c984851e4ee14e0949f6d92b3cb76d50b485c6b, // MYT
    0x24a2523439fe11907d82eaf779f9e03090f392c54f6e397b5d24c1a1e70a9a9a, // MEX
    0x0143595a584c3149a46677a3dacfb82cebad0e66d5afbb0daf6423334e15b83b, // FSM
    0x04d5f6b0481b4055de0aa8583c31776f91406e1694cdc9f114c80889ba813e9e, // MOZ
    0x072fe4f7250f35a09df696cc0c7ce94870330f27826c7e553252b0b61adf7bfe, // MDA
    0x2cdd9011da1147803f04dcc7442e54513754912346ae3ee7865d1aa9f5e53200, // MCO
    0x2ec5abe72fdbd6a0d6d2a0e7302f65ecec46ce6197c103f966aa728ed403c954, // MNG
    0x22708fb3e8f16fcf4b499a906db21d912383211452c0d918f7f2db19d3b290c2, // MNE
    0x1c51e3e5a5c0c756f9528060ca7905fa2e75f232a177dae41954f0fa73128056, // MSR
    0x06fa5a7e2113d5d142a73d8cd648deb4b6a20b1e3283009d59f82cc3da41e439, // MMR
    0x088394aa52033475c41f93cc6d2b403060a32b91bcebb7e7426c1fb40cabc9fc, // NAM
    0x1230ec07841e0891d533b51a582eadebbbdddf9239a951016970b96a76f36338, // NRU
    0x09ea8313da914a8c370b5e48fc075e5c0a36ad5c673a422633a8c1d369a60531, // NPL
    0x10f586fa5fbc42c1b91b3f4d0488e45b18794f715833660dda13efe2b6af08e2, // NIC
    0x27e731d6968a0284295890071ad5d76adff5574d39a04c4be21b820cce88e0e2, // NER
    0x2d245a0ecec5ebbc086c0f4cd5d96088c1a18629ba1ea1472dfb92021b74aaf5, // NGA
    0x29b2dec31b65ff7829112455a922926edcc6a2f60bb911d165fafce98543a631, // NIU
    0x1c92dfd53b81b8cbd067872ebf8f64a1690031f2282784d17b9170a1578a027a, // NOR
    0x1b211e3d73b17f64a8ff9407fed99d109041cdc70a292243bbdfbcb28c7deb8b, // NCL
    0x1b96796a5672bc274a24326acb5ca74aa5d6ef63ec50bb681e043b715e57d083, // NZL
    0x029a1bd7b5ca18c00eb18f94fbc06db0ce814187235171e0cdace73d1241a626, // OMN
    0x0f5be1a2047ac4fe0db368737b365f1e8304b73697920c0a4a86a8f484cb8cab, // PLW
    0x14357f214bdfaf03260e5665baaabef2aa9e481e3373b7be2d9d6c510229b0ab, // PAN
    0x06174fce9ebee5ff02ba73e73f25381950276b45d82153dd52fd604a351b75f5, // PNG
    0x0142ab9262fb5df44256de04035f5431b149832483fcf1486cc1dabbc5d9ae31, // PAK
    0x01c2cb2c83f057c938f17bf210860d820deb6df2830b753a3ca5ce596aad116e, // PRY
    0x0b1e7d365eba4c13b55f6af4e114b41a43fd69b491fc1b5bf860112025a7c0a4, // PER
    0x07f9a7ccc9524df2c3b15f51748cd9749b2b82c951f89073b06073b316baab79, // PYF
    0x1b6e68b73096edaeaa9c1a5bb195c36fdc4ef43f2ea9c27fec04e02b45775c1d, // POL
    0x2eb32e26b95ca612acb888d02149270dbe6759ead43ccc0d51a2e3fefdbf1ad4, // PRI
    0x1c1f3ee971164c56daef5dae9fa19056bbfb3e95691f92444e58e8f40b6f67f9, // PRT
    0x2ca2de5a62fe4d3804bae604102663d7b72a079cd11102af1c4fa0c0656d3a1c, // KEN
    0x17a92d388a0d169e884e6916e2d8cf5a5dd0c6ed63e9e9caa03055e54a791fcc, // KGZ
    0x240d8a57f4f12cd49c75c6047d11503ea6e762ec4e51199addb2cd443b7248da, // GBR
    0x15af1cdc454064dbb2d4572be1885e8eb27342b26dd02b72e2acbc6553990a86, // CAF
    0x2d967a0a044d4a5f57b6e48d2fe9b406886f6c19d4065f5ed5beaecb48200eed, // COD
    0x20efff2244d986b1741f77903c5ae17fe7a6e4ed4fd03c095247022bf3eb76c4, // DOM
    0x08dbdfb8893005442144e659def5f3b88a0f6eb6fcae7b659b8521b909e050f3, // CZE
    0x262b11b34dc283e7ea481e245eb2108ef1f209775be6fcea8ebf13647a87e25e, // ROM
    0x0326a1543aea533b356b82e195f8dfd87774dcd504d5d268d9291a18b03b2485, // RWA
    0x14f93e2152680130e47b8291bc3d16e918f36eddd0e519f3c25f4553e943c329, // RUS
    0x09cee0fbe591303f75fda1f5f2b54e62904af6416c5404b8f28a4bf1a7e0fe50, // ESH
    0x1b57d0ecc09441648d26b2da8626d31c357eb9c60abf447865e92c64b086b6be, // BES
    0x04ad5c79ab174a5e105dc2537da686f886b49d6171ba2d8bc33549ec66f90360, // WSM
    0x18bc2cf73bae17f62315840d3960d275544ec768bb777fd8eeacc3bcbfd228f8, // ASM
    0x10685bbdc6491563e05c60fd914d7f3bef71c8fe852a3bf9bc712675b1567579, // SMR
    0x149cbe6dae75ed6cc57cd81b208c8b59c2c1d4a7c07e7be660cd53bdcfb57010, // SHN
    0x1b9619aa8f9a5a768c2353d01c0f558feff5f1c00f8c294092de0e077f817356, // LCA
    0x2b59bf0d28705577d865caa46f0b9a22bc638adb51dc0a5099c830fbb50cb9bd, // BLM
    0x2d43d1a7c6978740a9be4bbc37c9c67bbfe281f193bc80f12cc77ad877adf002, // KNA
    0x0f51ad7c3bd3b28f0bf1df76d8bb2b6979cf477c249184ac2b318f1d11e208af, // SXM
    0x100d4f9d0b95f390fd9c0cb563b3992616e5a2f4e16c16e92e836eed0a03756a, // SPM
    0x24b04a2d0ac88271d62b4a8e49a45718ffeda9a139cfdb84f05d4a8a2267e846, // STP
    0x1419d16aae69c63a6128ed9f87592bfafe1070319f2709341d7128d138ab49e2, // VCT
    0x284dfa3039e17b1dd30069256a806f50b5f385611114cdf830f079fe80a5692a, // SEN
    0x0c9d7a9a677f4d3fd34a83f24ed8deafcf2f503514a1eeb2548b5845cb0d77c1, // SLE
    0x12cf431007435b3b7e03f5fc9517c2ee625bb1924acaf72283676aa42e2f8f2d, // SRB
    0x17a2cf6ec7752578c61ddf7190f4c9054ee420603e643e92e7b1f85092b8c8da, // SYC
    0x28037048aa29f010d389021e1b1717ad2444459af538981d916ff81c556b1135, // SYR
    0x2abe6cbe0d6c7a50eac75acf1bc1a8673b4d93e63c53e6a87a2399219b3142d6, // SOM
    0x1e3d4e7bed223ae836bd55938dbddd51cfdd9d587018c0653cbccb8e497ef315, // LKA
    0x295e8736c1e4e60f6e9aeb72530c7daa58156f7763c83cfdc940787919af7e7b, // SWZ
    0x198261a99aa1694834406df24f7b26dd31efd96955b671a45679b87f8df4f97f, // SDN
    0x1f14b9d04de06959b7aa98b7e0a7c3dfaa184c7f14ce04dd5f51b9444936661f, // SSD
    0x083071d06618956e98ca55e16a72b81488c623534bb4566961d32211ecd73376, // SWE
    0x13cff12af244a3c6eadc1423d1bbb56f2fcb73da85130ae958d762a1801b7586, // CHE
    0x0d4f35bbfa50bc364083ad71446dff41126e68c1e2ad308834e7ba819a36ccb0, // SUR
    0x0d63ab85925302677bb73ff21169c6574c065be815a4248534180601754745cf, // SJM
    0x025dd45cf645518b170f6c9876fd4f047e5ecf5589f0dc7853de335a13456398, // THA
    0x1a79cfb8682663dcca41d23714521839414188be565465014908edfa2e5e9996, // TWN
    0x26e0c66cff46058ee5cfefca24afcbe9efe27f2c3fa73f29c9a2616204a913dd, // TJK
    0x10c9ce8a8a723538aa3808fb616d84774fad92f442a59648f93f1b15680a5d02, // TZA
    0x1005cd47dab35e1e8c105ec82577228ca4e264a0ecfc777c92ac9d76f3a6ad46, // ATF
    0x1eca507ceb5edb2b0f78073c82f9ea964886d767dc8a409c08b96e6b04adb4db, // IOT
    0x192d41a669f04b6aa5712ad7ad2bce5cd91371fea1e8604272968593b6c5440c, // PSE
    0x075be196a0e210c2c22017264c9cf02aee4dc9a7e85e3f64fe67af03a9eba2d9, // TLS
    0x165221665e9e8f34c65810e19f1cc73490449ef8bd99b53c6f2b2c63708d1bdd, // TGO
    0x14b069e1361fdc0063bc099283a2bb34a0ec0289a680e69f87de4ec46e715af5, // TON
    0x20cf26d7ac530c02e54ccce25d799c495f7677ae3e7ec68addf45a031546a445, // TKL
    0x1d93507e890a0bda3f93db0c5873882c38297f925a296c32749743eb6c345bcd, // TTO
    0x207659cc0dfb5f54b09f4bba0c44023295235f1423254e08385e3502c962e36c, // TUN
    0x1713721acf98cd7b483bd83913609090246cab43d468a8d4b139976ca96e75b2, // TKM
    0x072d73680825360a1818a952bb2e6a731359326d3c9fa25555a69ac40742f7d2, // TUR
    0x2afcc8e8136cdf68f9d6cedacf83f56f8bdf2bf5f9edc0d97c597c68f29c9240, // TUV
    0x1f61093bd7b58c88fecd7877985b16b07def968ec734e8f813c4f62a478ab405, // UKR
    0x18d5b5041da2494b88c729f4c47d069667e7314d48e3e86561263c43b87a46e7, // UGA
    0x2a07e80f2bb05fe7dde9ab8e2184396668d1f667a365f7febf98d24a8d160645, // URY
    0x063e1597ab606c9ca0eebd309bca26ca1b4f818d05d75bc6f49153a511ee3055, // UZB
    0x2e96ff1093533f58b25741bd27e03979c3abd111735cedeb207ceb7125ddcf4f, // VUT
    0x1e3bb609554c22c94e753a0b0925290a7ff83fb96153dd96aa7862f23a3500ba, // VAT
    0x2788f1e28ed91564fa47b889b5c2239838a52644dfde52b1197f16f4c6d469de, // VEN
    0x2d5729d16187fdf4da6fa6bd6c0f92e0f01d5b91241f91ead6850cdb019fdaea, // VNM
    0x1e30b5795fdcf451012a4d7d88e89ee53509bf9179d9f58a7a968ba7bcfd7862, // WLF
    0x13359888f253debb4fb63e872d71af9f81eade6ef740980a7f0e4506bf5f2a96, // ZMB
    0x0c056f7f032ccec8e2305b0959d32044effca7673198ecb6e0b68875b0384bce // ZWE
  ];

  var index = -1;
  for (var i = 0; i < n; i++) {
      eq[i] = IsEqual();
      eq[i].in[0] <-- lookup[i];
      eq[i].in[1] <-- in;
      index += eq[i].out * (i + 2);
  }

  out <-- index;
}