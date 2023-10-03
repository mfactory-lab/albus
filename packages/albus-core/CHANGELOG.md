# Changelog

## 0.1.0 (2023-09-21)


### 🐞 Bug Fixes

* **albus-sdk:** new program integration, global improvements ([5a20a82](https://github.com/mfactory-lab/albus/commit/5a20a82f44902c7d0a9e9ce458bd13b652421fb3))
* **circuits:** remove `birthDate` from secret generation ([fdd4002](https://github.com/mfactory-lab/albus/commit/fdd4002ccad00465d430f729372c5da5d1ec9df7))
* **cli:** global improvements ([f38a7ca](https://github.com/mfactory-lab/albus/commit/f38a7ca37befcd5c7f8a8473e828c3b888272cda))
* **cli:** global improvements ([c0c6b3c](https://github.com/mfactory-lab/albus/commit/c0c6b3c5a0b2c6842f98924752f4312649d88bc5))
* **core:** add `claimsTree`, code refactored ([0ccca4c](https://github.com/mfactory-lab/albus/commit/0ccca4c0dce05d437b04338377ee7558c35e8244))
* **core:** add `decodeProof` nad `decodePublicSignals` ([af3b3ba](https://github.com/mfactory-lab/albus/commit/af3b3ba7f3e6437b975909290f9f7927109c499f))
* **core:** add `R1csInfo` type ([3a4f410](https://github.com/mfactory-lab/albus/commit/3a4f41080be8958b01e1114535e3b6fc77479547))
* **core:** add credential claims normalization ([abd7ee3](https://github.com/mfactory-lab/albus/commit/abd7ee355e2fbf2462849bcf1707c7ecd182a7e6))
* **core:** add global types ([d7e27c9](https://github.com/mfactory-lab/albus/commit/d7e27c9c1175a575ef68d234a31992087194250c))
* **core:** add zkp helper ([7500dca](https://github.com/mfactory-lab/albus/commit/7500dca0369d1f054e1b39c35a6a771d7c2c74a2))
* **core:** cleanup ([3874fb1](https://github.com/mfactory-lab/albus/commit/3874fb13ca6603d5f8b08c8473db62d8df9ec3e9))
* **core:** fix `verifyCredential`, removed `issuerPubkey` ([5bc2480](https://github.com/mfactory-lab/albus/commit/5bc24806aa68fde9caf5f3a340831113a738c6fd))
* **core:** fix imports ([09c1476](https://github.com/mfactory-lab/albus/commit/09c14767f17331d25ea4025090831df9b8d17c17))
* **core:** fix poseidon encryption, remove `ffjavacript`, global refactory ([bbc0754](https://github.com/mfactory-lab/albus/commit/bbc0754910bf3ccbffa9997dd7df322f792a9fff))
* **core:** fix unknown `fetch` ([d30bf28](https://github.com/mfactory-lab/albus/commit/d30bf289043ede5a7b66f662ab67b615e049eacb))
* **core:** fixed `package.json` ([2e6a222](https://github.com/mfactory-lab/albus/commit/2e6a22246aeabfbb7239089bc05adfd64a87fe8a))
* **core:** global fixes ([b94a12d](https://github.com/mfactory-lab/albus/commit/b94a12de045a75ba7a0411a1d16f41e055ffaef8))
* **core:** global fixes, removed `buffer` import ([e209401](https://github.com/mfactory-lab/albus/commit/e2094015fcdd6a8abea9755d6c1ede03066ef5ce))
* **core:** global improvements ([822c5d4](https://github.com/mfactory-lab/albus/commit/822c5d408a40ead82b5fe26449ffc9a533c750d6))
* **core:** global improvements ([08bbf86](https://github.com/mfactory-lab/albus/commit/08bbf866cfc3e8d52edcf9fdd04a29609deb520f))
* **core:** global improvements ([c3e1648](https://github.com/mfactory-lab/albus/commit/c3e16486c8b366bfac6dbba3703f758f5c830d96))
* **core:** global improvements, drop `circomlibjs`, add `@iden3/js-crypto` ([d13bdd8](https://github.com/mfactory-lab/albus/commit/d13bdd8f36dda75cddd32ad2c71587aec8f828ef))
* **core:** improve circomlib types ([ae6b45c](https://github.com/mfactory-lab/albus/commit/ae6b45c0cd49fba0caa0ed2198923cc299b2b115))
* **core:** improve snarkjs types ([86d3cca](https://github.com/mfactory-lab/albus/commit/86d3cca3e91b16fff87c98407c6ca36b30bc95ed))
* **core:** refactory zk utils ([0465fdc](https://github.com/mfactory-lab/albus/commit/0465fdc25a90647cbfac99617064ebc249a149be))
* **core:** rename zk helpers ([a7c71ad](https://github.com/mfactory-lab/albus/commit/a7c71ad63cf91a88fd28a4c2211200a9f1b97ae3))
* **core:** tests ([5d88d12](https://github.com/mfactory-lab/albus/commit/5d88d1281b844bf173cf0c14288f45c04cd0128f))
* **core:** utils fixes, add did helpers ([7a574e0](https://github.com/mfactory-lab/albus/commit/7a574e07da87ca886673607e0d0613a7de15b20f))
* decrease `uint8arrays` to ^3.1 to support `cjs` ([f15ae31](https://github.com/mfactory-lab/albus/commit/f15ae319c1f0bfda6868490de0158dbc463724c9))
* disable package prepare ([2928277](https://github.com/mfactory-lab/albus/commit/29282777db15d409f6c8a7469089f8b582d6a4bb))
* global improvements ([305fc70](https://github.com/mfactory-lab/albus/commit/305fc7066827396774f6b6e38a157a0efc3a522c))
* rename packages, release improvements ([f635c6b](https://github.com/mfactory-lab/albus/commit/f635c6b6ea78fcc8cd4430530aaef94a13510db0))
* **ui:** test ([c81e28d](https://github.com/mfactory-lab/albus/commit/c81e28dc67fe6ecb4cde3ec08f45ed67487d2a7d))


### 🌟 Features

* **core:** add `credential` helper ([9191bc0](https://github.com/mfactory-lab/albus/commit/9191bc0ae4cd1024b5ac1687bd38a44265043839))
* **core:** add `multibase` util ([d0d4cc7](https://github.com/mfactory-lab/albus/commit/d0d4cc775c84f7c2643cad6a2da47bf80ff794e0))
* **core:** add `vc` helpers ([c1fea80](https://github.com/mfactory-lab/albus/commit/c1fea803f31d70494bf3651c22f345d5a064e519))
* **core:** add more tests ([670f474](https://github.com/mfactory-lab/albus/commit/670f474bf2514b0ce6b95f45fea90cf664ea73c4))
* **core:** add shamir tools ([b742976](https://github.com/mfactory-lab/albus/commit/b74297622b5f1885a780101982d624371b9cede5))
* **core:** added new crypto modules ([2dcfa17](https://github.com/mfactory-lab/albus/commit/2dcfa176d0beee0cbc4cf1c77e879f338ceec496))


### ♻️ Refactors

* clean comments ([ae5347e](https://github.com/mfactory-lab/albus/commit/ae5347ec8165238ae82874a359780a09779364f3))
* **core:** crypto module fixes ([32ef094](https://github.com/mfactory-lab/albus/commit/32ef094863ac953e39f5e50ae92f25d3f059e4bc))
* **core:** global improvements ([91725e9](https://github.com/mfactory-lab/albus/commit/91725e9c894d306ae9ea925dec0045f4d1192b15))
* **core:** new hex utils ([4cf533a](https://github.com/mfactory-lab/albus/commit/4cf533a6027f9d2007f1b49f00a3cf2176cebe28))