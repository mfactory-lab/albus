export type Albus = {
  "version": "0.0.27",
  "name": "albus",
  "instructions": [
    {
      "name": "createIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateIssuerData"
          }
        }
      ]
    },
    {
      "name": "deleteIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createCredential",
      "accounts": [
        {
          "name": "albusAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Destination token account (required for pNFT).",
            ""
          ]
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Token record (required for pNFT).",
            ""
          ]
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Mint account of the NFT.",
            "The account will be initialized if necessary.",
            "",
            "Must be a signer if:",
            "* the mint account does not exist.",
            ""
          ]
        },
        {
          "name": "metadataAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the NFT.",
            "This account must be uninitialized.",
            ""
          ]
        },
        {
          "name": "editionAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Master edition account of the NFT.",
            "The account will be initialized if necessary.",
            ""
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL Token program."
          ]
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL Associated Token program."
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token Metadata program."
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Instructions sysvar account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateCredential",
      "accounts": [
        {
          "name": "albusAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "credentialRequest",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "(Optional) Credential request."
          ]
        },
        {
          "name": "credentialRequestIssuer",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "(Optional) Credential request issuer."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint account of the NFT.",
            ""
          ]
        },
        {
          "name": "metadataAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the NFT."
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Instructions sysvar account.",
            ""
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token Metadata program.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateCredentialData"
          }
        }
      ]
    },
    {
      "name": "deleteCredential",
      "accounts": [
        {
          "name": "albusAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Destination token account (required for pNFT).",
            ""
          ]
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint account of the NFT.",
            "The account will be initialized if necessary.",
            "",
            "Must be a signer if:",
            "* the mint account does not exist.",
            ""
          ]
        },
        {
          "name": "metadataAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the NFT.",
            "This account must be uninitialized.",
            ""
          ]
        },
        {
          "name": "editionAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Master edition account of the NFT.",
            "The account will be initialized if necessary.",
            ""
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token Metadata program.",
            ""
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL Token program."
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Instructions sysvar account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "requestCredential",
      "accounts": [
        {
          "name": "credentialRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "credentialSpec",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "credentialMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "credentialToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "RequestCredentialData"
          }
        }
      ]
    },
    {
      "name": "createCredentialSpec",
      "accounts": [
        {
          "name": "credentialSpec",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateCredentialSpecData"
          }
        }
      ]
    },
    {
      "name": "deleteCredentialSpec",
      "accounts": [
        {
          "name": "credentialSpec",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createCircuit",
      "accounts": [
        {
          "name": "circuit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateCircuitData"
          }
        }
      ]
    },
    {
      "name": "updateCircuitVk",
      "accounts": [
        {
          "name": "circuit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateCircuitVkData"
          }
        }
      ]
    },
    {
      "name": "deleteCircuit",
      "accounts": [
        {
          "name": "circuit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createServiceProvider",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateServiceProviderData"
          }
        }
      ]
    },
    {
      "name": "updateServiceProvider",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateServiceProviderData"
          }
        }
      ]
    },
    {
      "name": "deleteServiceProvider",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPolicy",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreatePolicyData"
          }
        }
      ]
    },
    {
      "name": "updatePolicy",
      "accounts": [
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serviceProvider",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdatePolicyData"
          }
        }
      ]
    },
    {
      "name": "deletePolicy",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateTrusteeData"
          }
        }
      ]
    },
    {
      "name": "updateTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateTrusteeData"
          }
        }
      ]
    },
    {
      "name": "verifyTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProofRequest",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateProofRequestData"
          }
        }
      ]
    },
    {
      "name": "deleteProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "proveProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "ProveProofRequestData"
          }
        }
      ]
    },
    {
      "name": "verifyProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateProofRequestData"
          }
        }
      ]
    },
    {
      "name": "createInvestigationRequest",
      "accounts": [
        {
          "name": "investigationRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serviceProvider",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateInvestigationRequestData"
          }
        }
      ]
    },
    {
      "name": "deleteInvestigationRequest",
      "accounts": [
        {
          "name": "investigationRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "revealSecretShare",
      "accounts": [
        {
          "name": "investigationRequestShare",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "investigationRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "RevealSecretShareData"
          }
        }
      ]
    },
    {
      "name": "adminCloseAccount",
      "accounts": [
        {
          "name": "account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "issuer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "docs": [
              "The authority of the issuer"
            ],
            "type": "publicKey"
          },
          {
            "name": "zkPubkey",
            "docs": [
              "The ZK authority of the issuer (bbj-pubkey)"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "authority",
            "docs": [
              "The authority of the issuer"
            ],
            "type": "publicKey"
          },
          {
            "name": "isDisabled",
            "docs": [
              "Issuer status"
            ],
            "type": "bool"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          },
          {
            "name": "code",
            "docs": [
              "Uniq code of the issuer"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "The name of the issuer"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Short description"
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "circuit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "docs": [
              "Uniq code of the circuit"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the circuit"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Short description"
            ],
            "type": "string"
          },
          {
            "name": "wasmUri",
            "type": "string"
          },
          {
            "name": "zkeyUri",
            "type": "string"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          },
          {
            "name": "vk",
            "docs": [
              "Verification key"
            ],
            "type": {
              "defined": "VerificationKey"
            }
          },
          {
            "name": "outputs",
            "docs": [
              "Output signals associated with the circuit"
            ],
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "publicSignals",
            "docs": [
              "Public signals associated with the circuit"
            ],
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "privateSignals",
            "docs": [
              "Private signals associated with the circuit"
            ],
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "policy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "serviceProvider",
            "docs": [
              "The service provider this belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "circuit",
            "docs": [
              "The circuit associated with this policy"
            ],
            "type": "publicKey"
          },
          {
            "name": "code",
            "docs": [
              "Unique code of the policy (associated with the service)"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the policy"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Short description"
            ],
            "type": "string"
          },
          {
            "name": "expirationPeriod",
            "docs": [
              "Request expiration period in seconds"
            ],
            "type": "u32"
          },
          {
            "name": "retentionPeriod",
            "docs": [
              "Request retention period in seconds"
            ],
            "type": "u32"
          },
          {
            "name": "proofRequestCount",
            "docs": [
              "Total number of proof requests"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "rules",
            "docs": [
              "Policy rules"
            ],
            "type": {
              "vec": {
                "defined": "PolicyRule"
              }
            }
          }
        ]
      }
    },
    {
      "name": "serviceProvider",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that manages the service"
            ],
            "type": "publicKey"
          },
          {
            "name": "code",
            "docs": [
              "Unique code identifying the service"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the service"
            ],
            "type": "string"
          },
          {
            "name": "website",
            "docs": [
              "The website link"
            ],
            "type": "string"
          },
          {
            "name": "contactInfo",
            "docs": [
              "Contact information"
            ],
            "type": {
              "defined": "ContactInfo"
            }
          },
          {
            "name": "proofRequestCount",
            "docs": [
              "Total number of proof requests"
            ],
            "type": "u64"
          },
          {
            "name": "policyCount",
            "docs": [
              "Total number of policies"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp for when the service was registered"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "secretShareThreshold",
            "docs": [
              "Required number of trustee shares used to reconstruct the proof request secret"
            ],
            "type": "u8"
          },
          {
            "name": "trustees",
            "docs": [
              "List of selected trustees"
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "trustee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "docs": [
              "Key that is used for secret sharing encryption.",
              "BabyJub packed pubkey"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "docs": [
              "The authority that manages the trustee"
            ],
            "type": "publicKey"
          },
          {
            "name": "name",
            "docs": [
              "Name of the trustee"
            ],
            "type": "string"
          },
          {
            "name": "email",
            "docs": [
              "Email of the trustee"
            ],
            "type": "string"
          },
          {
            "name": "website",
            "docs": [
              "Website of the trustee"
            ],
            "type": "string"
          },
          {
            "name": "isVerified",
            "docs": [
              "Indicates whether the [Trustee] has been verified"
            ],
            "type": "bool"
          },
          {
            "name": "revealedShareCount",
            "docs": [
              "The number of revealed secret shares"
            ],
            "type": "u32"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp for when the trustee was registered"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "investigationRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Investigation service authority public key"
            ],
            "type": "publicKey"
          },
          {
            "name": "encryptionKey",
            "docs": [
              "The key that is used for secret sharing encryption"
            ],
            "type": "publicKey"
          },
          {
            "name": "proofRequest",
            "docs": [
              "The [ProofRequest] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "proofRequestOwner",
            "docs": [
              "The public key of the user who owns the [ProofRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "serviceProvider",
            "docs": [
              "The [ServiceProvider] associated with [ProofRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "requiredShareCount",
            "docs": [
              "Required number of shares used to reconstruct the secret"
            ],
            "type": "u8"
          },
          {
            "name": "revealedShareCount",
            "docs": [
              "Revealed number of shares used to reconstruct the secret"
            ],
            "type": "u8"
          },
          {
            "name": "status",
            "docs": [
              "Investigation processing status"
            ],
            "type": {
              "defined": "InvestigationStatus"
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "trustees",
            "docs": [
              "[Trustee] accounts that were used for secret sharing"
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "investigationRequestShare",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investigationRequest",
            "docs": [
              "The address of the [InvestigationRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "proofRequestOwner",
            "docs": [
              "The public key of the user who owns the [ProofRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "trustee",
            "docs": [
              "The address of the [Trustee]"
            ],
            "type": "publicKey"
          },
          {
            "name": "index",
            "docs": [
              "Share position"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "revealedAt",
            "docs": [
              "Revelation date"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Revelation status"
            ],
            "type": {
              "defined": "RevelationStatus"
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "share",
            "docs": [
              "Encrypted share"
            ],
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "proofRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "serviceProvider",
            "docs": [
              "The [ServiceProvider] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "policy",
            "docs": [
              "The [Policy] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "circuit",
            "docs": [
              "The [Circuit] used for proof generation"
            ],
            "type": "publicKey"
          },
          {
            "name": "issuer",
            "docs": [
              "The [Issuer] used for proof generation"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "Proof request creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "identifier",
            "docs": [
              "Auto-increment service specific identifier"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp for when the request was created"
            ],
            "type": "i64"
          },
          {
            "name": "expiredAt",
            "docs": [
              "Timestamp for when the request will expire"
            ],
            "type": "i64"
          },
          {
            "name": "verifiedAt",
            "docs": [
              "Timestamp for when the `proof` was verified"
            ],
            "type": "i64"
          },
          {
            "name": "provedAt",
            "docs": [
              "Timestamp for when the user was added the `proof`"
            ],
            "type": "i64"
          },
          {
            "name": "retentionEndDate",
            "docs": [
              "Timestamp indicating when the data will no longer be stored"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Status of the request"
            ],
            "type": {
              "defined": "ProofRequestStatus"
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "proof",
            "docs": [
              "Proof payload"
            ],
            "type": {
              "option": {
                "defined": "ProofData"
              }
            }
          },
          {
            "name": "publicInputs",
            "docs": [
              "Public inputs that are used to verify the `proof`"
            ],
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "credentialRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "credentialSpec",
            "docs": [
              "The [CredentialSpec] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "credentialMint",
            "docs": [
              "Credential mint address"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "Credential request creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "issuer",
            "docs": [
              "The [Issuer] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "uri",
            "docs": [
              "Presentation Submission"
            ],
            "type": "string"
          },
          {
            "name": "status",
            "docs": [
              "Status of the request"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "credentialSpec",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "docs": [
              "The [Issuer] associated with this spec"
            ],
            "type": "publicKey"
          },
          {
            "name": "name",
            "docs": [
              "The name of the credential spec"
            ],
            "type": "string"
          },
          {
            "name": "credentialRequestCount",
            "docs": [
              "Total number of credential requests associated with this spec"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "uri",
            "docs": [
              "Presentation definition",
              "https://identity.foundation/presentation-exchange/#presentation-definition"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateCircuitData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "wasmUri",
            "type": "string"
          },
          {
            "name": "zkeyUri",
            "type": "string"
          },
          {
            "name": "outputs",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "publicSignals",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "privateSignals",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateCircuitVkData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": {
              "option": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          },
          {
            "name": "beta",
            "type": {
              "option": {
                "array": [
                  "u8",
                  128
                ]
              }
            }
          },
          {
            "name": "gamma",
            "type": {
              "option": {
                "array": [
                  "u8",
                  128
                ]
              }
            }
          },
          {
            "name": "delta",
            "type": {
              "option": {
                "array": [
                  "u8",
                  128
                ]
              }
            }
          },
          {
            "name": "ic",
            "type": {
              "option": {
                "vec": {
                  "array": [
                    "u8",
                    64
                  ]
                }
              }
            }
          },
          {
            "name": "extendIc",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreateCredentialSpecData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "RequestCredentialData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "UpdateCredentialData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "CreateInvestigationRequestData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptionKey",
            "type": "publicKey"
          },
          {
            "name": "trustees",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "RevealSecretShareData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "share",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "CreateIssuerData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "zkPubkey",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "CreatePolicyData",
      "docs": [
        "Data required to create a new proof request"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "expirationPeriod",
            "type": "u32"
          },
          {
            "name": "retentionPeriod",
            "type": "u32"
          },
          {
            "name": "rules",
            "type": {
              "vec": {
                "defined": "PolicyRule"
              }
            }
          }
        ]
      }
    },
    {
      "name": "UpdatePolicyData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "description",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "expirationPeriod",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "retentionPeriod",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "rules",
            "type": {
              "option": {
                "vec": {
                  "defined": "PolicyRule"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "CreateProofRequestData",
      "docs": [
        "Data required to create a new proof request"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "expiresIn",
            "docs": [
              "Time in seconds until the request expires"
            ],
            "type": "u32"
          },
          {
            "name": "maxPublicInputs",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProveProofRequestData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proof",
            "type": {
              "option": {
                "defined": "ProofData"
              }
            }
          },
          {
            "name": "publicInputs",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "reset",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "UpdateProofRequestData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "status",
            "type": {
              "defined": "ProofRequestStatus"
            }
          }
        ]
      }
    },
    {
      "name": "CreateServiceProviderData",
      "docs": [
        "Data required to add a new service provider"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "docs": [
              "The unique code representing the service"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "The name of the service"
            ],
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "contactInfo",
            "type": {
              "option": {
                "defined": "ContactInfo"
              }
            }
          },
          {
            "name": "authority",
            "docs": [
              "Service authority"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "secretShareThreshold",
            "docs": [
              "Required number of shares used to reconstruct the secret"
            ],
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "trustees",
            "type": {
              "option": {
                "vec": "publicKey"
              }
            }
          }
        ]
      }
    },
    {
      "name": "UpdateServiceProviderData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "website",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "contactInfo",
            "type": {
              "option": {
                "defined": "ContactInfo"
              }
            }
          },
          {
            "name": "secretShareThreshold",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "clearTrustees",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreateTrusteeData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "authority",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateTrusteeData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "email",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "website",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "ProofData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VerificationKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "beta",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "gamma",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "delta",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "ic",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "PolicyRule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "value",
            "docs": [
              "Scalar Field"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "label",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "ContactInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "value",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "InvestigationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "InProgress"
          },
          {
            "name": "UnderReview"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    },
    {
      "name": "RevelationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "RevealedByUser"
          },
          {
            "name": "RevealedByTrustee"
          }
        ]
      }
    },
    {
      "name": "ProofRequestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Proved"
          },
          {
            "name": "Verified"
          },
          {
            "name": "Rejected"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateProofRequestEvent",
      "fields": [
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "policy",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "DeleteProofRequestEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ProveEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "circuit",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "VerifyEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "circuit",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "RejectEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "circuit",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "RevealSecretShareEvent",
      "fields": [
        {
          "name": "investigationRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequestOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "trustee",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "RevelationStatus"
          },
          "index": false
        },
        {
          "name": "index",
          "type": "u8",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "CreateInvestigationRequestEvent",
      "fields": [
        {
          "name": "investigationRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequestOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "DeleteInvestigationRequestEvent",
      "fields": [
        {
          "name": "investigationRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequestOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "CreateCredentialRequestEvent",
      "fields": [
        {
          "name": "credentialSpec",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "credentialMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "issuer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "uri",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6001,
      "name": "Unverified",
      "msg": "Unverified"
    },
    {
      "code": 6002,
      "name": "Unproved",
      "msg": "Unproved"
    },
    {
      "code": 6003,
      "name": "Expired",
      "msg": "Expired"
    },
    {
      "code": 6004,
      "name": "InvalidData",
      "msg": "Invalid data"
    },
    {
      "code": 6005,
      "name": "InvalidOwner",
      "msg": "Invalid owner"
    },
    {
      "code": 6006,
      "name": "InvalidMetadata",
      "msg": "Invalid metadata"
    },
    {
      "code": 6007,
      "name": "ProofVerificationFailed",
      "msg": "Proof verification failed"
    },
    {
      "code": 6008,
      "name": "InvalidPublicInputs",
      "msg": "Invalid public inputs"
    }
  ]
};

export const IDL: Albus = {
  "version": "0.0.27",
  "name": "albus",
  "instructions": [
    {
      "name": "createIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateIssuerData"
          }
        }
      ]
    },
    {
      "name": "deleteIssuer",
      "accounts": [
        {
          "name": "issuer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createCredential",
      "accounts": [
        {
          "name": "albusAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Destination token account (required for pNFT).",
            ""
          ]
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Token record (required for pNFT).",
            ""
          ]
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Mint account of the NFT.",
            "The account will be initialized if necessary.",
            "",
            "Must be a signer if:",
            "* the mint account does not exist.",
            ""
          ]
        },
        {
          "name": "metadataAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the NFT.",
            "This account must be uninitialized.",
            ""
          ]
        },
        {
          "name": "editionAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Master edition account of the NFT.",
            "The account will be initialized if necessary.",
            ""
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL Token program."
          ]
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL Associated Token program."
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token Metadata program."
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Instructions sysvar account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateCredential",
      "accounts": [
        {
          "name": "albusAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "credentialRequest",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "(Optional) Credential request."
          ]
        },
        {
          "name": "credentialRequestIssuer",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "(Optional) Credential request issuer."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint account of the NFT.",
            ""
          ]
        },
        {
          "name": "metadataAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the NFT."
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Instructions sysvar account.",
            ""
          ]
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token Metadata program.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateCredentialData"
          }
        }
      ]
    },
    {
      "name": "deleteCredential",
      "accounts": [
        {
          "name": "albusAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Destination token account (required for pNFT).",
            ""
          ]
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint account of the NFT.",
            "The account will be initialized if necessary.",
            "",
            "Must be a signer if:",
            "* the mint account does not exist.",
            ""
          ]
        },
        {
          "name": "metadataAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the NFT.",
            "This account must be uninitialized.",
            ""
          ]
        },
        {
          "name": "editionAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Master edition account of the NFT.",
            "The account will be initialized if necessary.",
            ""
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Token Metadata program.",
            ""
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL Token program."
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Instructions sysvar account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "requestCredential",
      "accounts": [
        {
          "name": "credentialRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "credentialSpec",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "credentialMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "credentialToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "System program."
          ]
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "RequestCredentialData"
          }
        }
      ]
    },
    {
      "name": "createCredentialSpec",
      "accounts": [
        {
          "name": "credentialSpec",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateCredentialSpecData"
          }
        }
      ]
    },
    {
      "name": "deleteCredentialSpec",
      "accounts": [
        {
          "name": "credentialSpec",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createCircuit",
      "accounts": [
        {
          "name": "circuit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateCircuitData"
          }
        }
      ]
    },
    {
      "name": "updateCircuitVk",
      "accounts": [
        {
          "name": "circuit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateCircuitVkData"
          }
        }
      ]
    },
    {
      "name": "deleteCircuit",
      "accounts": [
        {
          "name": "circuit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createServiceProvider",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateServiceProviderData"
          }
        }
      ]
    },
    {
      "name": "updateServiceProvider",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateServiceProviderData"
          }
        }
      ]
    },
    {
      "name": "deleteServiceProvider",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPolicy",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreatePolicyData"
          }
        }
      ]
    },
    {
      "name": "updatePolicy",
      "accounts": [
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serviceProvider",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdatePolicyData"
          }
        }
      ]
    },
    {
      "name": "deletePolicy",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateTrusteeData"
          }
        }
      ]
    },
    {
      "name": "updateTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateTrusteeData"
          }
        }
      ]
    },
    {
      "name": "verifyTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteTrustee",
      "accounts": [
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProofRequest",
      "accounts": [
        {
          "name": "serviceProvider",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateProofRequestData"
          }
        }
      ]
    },
    {
      "name": "deleteProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "proveProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "policy",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "issuer",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "ProveProofRequestData"
          }
        }
      ]
    },
    {
      "name": "verifyProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "circuit",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateProofRequest",
      "accounts": [
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "UpdateProofRequestData"
          }
        }
      ]
    },
    {
      "name": "createInvestigationRequest",
      "accounts": [
        {
          "name": "investigationRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proofRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serviceProvider",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "CreateInvestigationRequestData"
          }
        }
      ]
    },
    {
      "name": "deleteInvestigationRequest",
      "accounts": [
        {
          "name": "investigationRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "revealSecretShare",
      "accounts": [
        {
          "name": "investigationRequestShare",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "investigationRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "trustee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "RevealSecretShareData"
          }
        }
      ]
    },
    {
      "name": "adminCloseAccount",
      "accounts": [
        {
          "name": "account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "issuer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "docs": [
              "The authority of the issuer"
            ],
            "type": "publicKey"
          },
          {
            "name": "zkPubkey",
            "docs": [
              "The ZK authority of the issuer (bbj-pubkey)"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "authority",
            "docs": [
              "The authority of the issuer"
            ],
            "type": "publicKey"
          },
          {
            "name": "isDisabled",
            "docs": [
              "Issuer status"
            ],
            "type": "bool"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          },
          {
            "name": "code",
            "docs": [
              "Uniq code of the issuer"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "The name of the issuer"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Short description"
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "circuit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "docs": [
              "Uniq code of the circuit"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the circuit"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Short description"
            ],
            "type": "string"
          },
          {
            "name": "wasmUri",
            "type": "string"
          },
          {
            "name": "zkeyUri",
            "type": "string"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump."
            ],
            "type": "u8"
          },
          {
            "name": "vk",
            "docs": [
              "Verification key"
            ],
            "type": {
              "defined": "VerificationKey"
            }
          },
          {
            "name": "outputs",
            "docs": [
              "Output signals associated with the circuit"
            ],
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "publicSignals",
            "docs": [
              "Public signals associated with the circuit"
            ],
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "privateSignals",
            "docs": [
              "Private signals associated with the circuit"
            ],
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "policy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "serviceProvider",
            "docs": [
              "The service provider this belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "circuit",
            "docs": [
              "The circuit associated with this policy"
            ],
            "type": "publicKey"
          },
          {
            "name": "code",
            "docs": [
              "Unique code of the policy (associated with the service)"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the policy"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Short description"
            ],
            "type": "string"
          },
          {
            "name": "expirationPeriod",
            "docs": [
              "Request expiration period in seconds"
            ],
            "type": "u32"
          },
          {
            "name": "retentionPeriod",
            "docs": [
              "Request retention period in seconds"
            ],
            "type": "u32"
          },
          {
            "name": "proofRequestCount",
            "docs": [
              "Total number of proof requests"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "rules",
            "docs": [
              "Policy rules"
            ],
            "type": {
              "vec": {
                "defined": "PolicyRule"
              }
            }
          }
        ]
      }
    },
    {
      "name": "serviceProvider",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that manages the service"
            ],
            "type": "publicKey"
          },
          {
            "name": "code",
            "docs": [
              "Unique code identifying the service"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "Name of the service"
            ],
            "type": "string"
          },
          {
            "name": "website",
            "docs": [
              "The website link"
            ],
            "type": "string"
          },
          {
            "name": "contactInfo",
            "docs": [
              "Contact information"
            ],
            "type": {
              "defined": "ContactInfo"
            }
          },
          {
            "name": "proofRequestCount",
            "docs": [
              "Total number of proof requests"
            ],
            "type": "u64"
          },
          {
            "name": "policyCount",
            "docs": [
              "Total number of policies"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp for when the service was registered"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "secretShareThreshold",
            "docs": [
              "Required number of trustee shares used to reconstruct the proof request secret"
            ],
            "type": "u8"
          },
          {
            "name": "trustees",
            "docs": [
              "List of selected trustees"
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "trustee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "docs": [
              "Key that is used for secret sharing encryption.",
              "BabyJub packed pubkey"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "docs": [
              "The authority that manages the trustee"
            ],
            "type": "publicKey"
          },
          {
            "name": "name",
            "docs": [
              "Name of the trustee"
            ],
            "type": "string"
          },
          {
            "name": "email",
            "docs": [
              "Email of the trustee"
            ],
            "type": "string"
          },
          {
            "name": "website",
            "docs": [
              "Website of the trustee"
            ],
            "type": "string"
          },
          {
            "name": "isVerified",
            "docs": [
              "Indicates whether the [Trustee] has been verified"
            ],
            "type": "bool"
          },
          {
            "name": "revealedShareCount",
            "docs": [
              "The number of revealed secret shares"
            ],
            "type": "u32"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp for when the trustee was registered"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "investigationRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Investigation service authority public key"
            ],
            "type": "publicKey"
          },
          {
            "name": "encryptionKey",
            "docs": [
              "The key that is used for secret sharing encryption"
            ],
            "type": "publicKey"
          },
          {
            "name": "proofRequest",
            "docs": [
              "The [ProofRequest] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "proofRequestOwner",
            "docs": [
              "The public key of the user who owns the [ProofRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "serviceProvider",
            "docs": [
              "The [ServiceProvider] associated with [ProofRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "requiredShareCount",
            "docs": [
              "Required number of shares used to reconstruct the secret"
            ],
            "type": "u8"
          },
          {
            "name": "revealedShareCount",
            "docs": [
              "Revealed number of shares used to reconstruct the secret"
            ],
            "type": "u8"
          },
          {
            "name": "status",
            "docs": [
              "Investigation processing status"
            ],
            "type": {
              "defined": "InvestigationStatus"
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "trustees",
            "docs": [
              "[Trustee] accounts that were used for secret sharing"
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "investigationRequestShare",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "investigationRequest",
            "docs": [
              "The address of the [InvestigationRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "proofRequestOwner",
            "docs": [
              "The public key of the user who owns the [ProofRequest]"
            ],
            "type": "publicKey"
          },
          {
            "name": "trustee",
            "docs": [
              "The address of the [Trustee]"
            ],
            "type": "publicKey"
          },
          {
            "name": "index",
            "docs": [
              "Share position"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "revealedAt",
            "docs": [
              "Revelation date"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Revelation status"
            ],
            "type": {
              "defined": "RevelationStatus"
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "share",
            "docs": [
              "Encrypted share"
            ],
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "proofRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "serviceProvider",
            "docs": [
              "The [ServiceProvider] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "policy",
            "docs": [
              "The [Policy] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "circuit",
            "docs": [
              "The [Circuit] used for proof generation"
            ],
            "type": "publicKey"
          },
          {
            "name": "issuer",
            "docs": [
              "The [Issuer] used for proof generation"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "Proof request creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "identifier",
            "docs": [
              "Auto-increment service specific identifier"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp for when the request was created"
            ],
            "type": "i64"
          },
          {
            "name": "expiredAt",
            "docs": [
              "Timestamp for when the request will expire"
            ],
            "type": "i64"
          },
          {
            "name": "verifiedAt",
            "docs": [
              "Timestamp for when the `proof` was verified"
            ],
            "type": "i64"
          },
          {
            "name": "provedAt",
            "docs": [
              "Timestamp for when the user was added the `proof`"
            ],
            "type": "i64"
          },
          {
            "name": "retentionEndDate",
            "docs": [
              "Timestamp indicating when the data will no longer be stored"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Status of the request"
            ],
            "type": {
              "defined": "ProofRequestStatus"
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "proof",
            "docs": [
              "Proof payload"
            ],
            "type": {
              "option": {
                "defined": "ProofData"
              }
            }
          },
          {
            "name": "publicInputs",
            "docs": [
              "Public inputs that are used to verify the `proof`"
            ],
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "credentialRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "credentialSpec",
            "docs": [
              "The [CredentialSpec] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "credentialMint",
            "docs": [
              "Credential mint address"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "Credential request creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "issuer",
            "docs": [
              "The [Issuer] associated with this request"
            ],
            "type": "publicKey"
          },
          {
            "name": "uri",
            "docs": [
              "Presentation Submission"
            ],
            "type": "string"
          },
          {
            "name": "status",
            "docs": [
              "Status of the request"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation date"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "credentialSpec",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "docs": [
              "The [Issuer] associated with this spec"
            ],
            "type": "publicKey"
          },
          {
            "name": "name",
            "docs": [
              "The name of the credential spec"
            ],
            "type": "string"
          },
          {
            "name": "credentialRequestCount",
            "docs": [
              "Total number of credential requests associated with this spec"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "uri",
            "docs": [
              "Presentation definition",
              "https://identity.foundation/presentation-exchange/#presentation-definition"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateCircuitData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "wasmUri",
            "type": "string"
          },
          {
            "name": "zkeyUri",
            "type": "string"
          },
          {
            "name": "outputs",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "publicSignals",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "privateSignals",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateCircuitVkData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": {
              "option": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          },
          {
            "name": "beta",
            "type": {
              "option": {
                "array": [
                  "u8",
                  128
                ]
              }
            }
          },
          {
            "name": "gamma",
            "type": {
              "option": {
                "array": [
                  "u8",
                  128
                ]
              }
            }
          },
          {
            "name": "delta",
            "type": {
              "option": {
                "array": [
                  "u8",
                  128
                ]
              }
            }
          },
          {
            "name": "ic",
            "type": {
              "option": {
                "vec": {
                  "array": [
                    "u8",
                    64
                  ]
                }
              }
            }
          },
          {
            "name": "extendIc",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreateCredentialSpecData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "RequestCredentialData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "UpdateCredentialData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "CreateInvestigationRequestData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptionKey",
            "type": "publicKey"
          },
          {
            "name": "trustees",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "RevealSecretShareData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "share",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "CreateIssuerData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "zkPubkey",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "CreatePolicyData",
      "docs": [
        "Data required to create a new proof request"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "expirationPeriod",
            "type": "u32"
          },
          {
            "name": "retentionPeriod",
            "type": "u32"
          },
          {
            "name": "rules",
            "type": {
              "vec": {
                "defined": "PolicyRule"
              }
            }
          }
        ]
      }
    },
    {
      "name": "UpdatePolicyData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "description",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "expirationPeriod",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "retentionPeriod",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "rules",
            "type": {
              "option": {
                "vec": {
                  "defined": "PolicyRule"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "CreateProofRequestData",
      "docs": [
        "Data required to create a new proof request"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "expiresIn",
            "docs": [
              "Time in seconds until the request expires"
            ],
            "type": "u32"
          },
          {
            "name": "maxPublicInputs",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProveProofRequestData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proof",
            "type": {
              "option": {
                "defined": "ProofData"
              }
            }
          },
          {
            "name": "publicInputs",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "reset",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "UpdateProofRequestData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "status",
            "type": {
              "defined": "ProofRequestStatus"
            }
          }
        ]
      }
    },
    {
      "name": "CreateServiceProviderData",
      "docs": [
        "Data required to add a new service provider"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "code",
            "docs": [
              "The unique code representing the service"
            ],
            "type": "string"
          },
          {
            "name": "name",
            "docs": [
              "The name of the service"
            ],
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "contactInfo",
            "type": {
              "option": {
                "defined": "ContactInfo"
              }
            }
          },
          {
            "name": "authority",
            "docs": [
              "Service authority"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "secretShareThreshold",
            "docs": [
              "Required number of shares used to reconstruct the secret"
            ],
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "trustees",
            "type": {
              "option": {
                "vec": "publicKey"
              }
            }
          }
        ]
      }
    },
    {
      "name": "UpdateServiceProviderData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "website",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "contactInfo",
            "type": {
              "option": {
                "defined": "ContactInfo"
              }
            }
          },
          {
            "name": "secretShareThreshold",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "clearTrustees",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreateTrusteeData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "authority",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateTrusteeData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "email",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "website",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "ProofData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VerificationKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "beta",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "gamma",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "delta",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "ic",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  64
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "PolicyRule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "value",
            "docs": [
              "Scalar Field"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "label",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "ContactInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "value",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "InvestigationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "InProgress"
          },
          {
            "name": "UnderReview"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    },
    {
      "name": "RevelationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "RevealedByUser"
          },
          {
            "name": "RevealedByTrustee"
          }
        ]
      }
    },
    {
      "name": "ProofRequestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Proved"
          },
          {
            "name": "Verified"
          },
          {
            "name": "Rejected"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateProofRequestEvent",
      "fields": [
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "policy",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "DeleteProofRequestEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ProveEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "circuit",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "VerifyEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "circuit",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "RejectEvent",
      "fields": [
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "serviceProvider",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "circuit",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "RevealSecretShareEvent",
      "fields": [
        {
          "name": "investigationRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequestOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "trustee",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "RevelationStatus"
          },
          "index": false
        },
        {
          "name": "index",
          "type": "u8",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "CreateInvestigationRequestEvent",
      "fields": [
        {
          "name": "investigationRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequestOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "DeleteInvestigationRequestEvent",
      "fields": [
        {
          "name": "investigationRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequest",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proofRequestOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "CreateCredentialRequestEvent",
      "fields": [
        {
          "name": "credentialSpec",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "credentialMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "issuer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "uri",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6001,
      "name": "Unverified",
      "msg": "Unverified"
    },
    {
      "code": 6002,
      "name": "Unproved",
      "msg": "Unproved"
    },
    {
      "code": 6003,
      "name": "Expired",
      "msg": "Expired"
    },
    {
      "code": 6004,
      "name": "InvalidData",
      "msg": "Invalid data"
    },
    {
      "code": 6005,
      "name": "InvalidOwner",
      "msg": "Invalid owner"
    },
    {
      "code": 6006,
      "name": "InvalidMetadata",
      "msg": "Invalid metadata"
    },
    {
      "code": 6007,
      "name": "ProofVerificationFailed",
      "msg": "Proof verification failed"
    },
    {
      "code": 6008,
      "name": "InvalidPublicInputs",
      "msg": "Invalid public inputs"
    }
  ]
};