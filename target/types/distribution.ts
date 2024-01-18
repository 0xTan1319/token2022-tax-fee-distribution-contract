export type Distribution = {
  "version": "0.1.0",
  "name": "distribution",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "adminWallet",
          "type": "publicKey"
        },
        {
          "name": "callerWallet",
          "type": "publicKey"
        },
        {
          "name": "startingBlock",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateCallerAddress",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newCaller",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "mineBlock",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "minedInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "blockNumber",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "caller",
            "type": "publicKey"
          },
          {
            "name": "currentReward",
            "type": "u64"
          },
          {
            "name": "halvedTimes",
            "type": "u64"
          },
          {
            "name": "lastHalvedBlockNumber",
            "type": "u64"
          },
          {
            "name": "lastMineTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "minedInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winnerAddress",
            "type": "publicKey"
          },
          {
            "name": "blockNumber",
            "type": "u64"
          },
          {
            "name": "rewardSent",
            "type": "u64"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAdmin",
      "msg": "This address is not admin wallet"
    },
    {
      "code": 6001,
      "name": "InvalidCaller",
      "msg": "This address is not caller wallet"
    },
    {
      "code": 6002,
      "name": "InvalidMiningTime",
      "msg": "Mining is not allowed within 5 minutes"
    },
    {
      "code": 6003,
      "name": "InvalidBlockNumber",
      "msg": "Passed block number is not valid"
    }
  ]
};

export const IDL: Distribution = {
  "version": "0.1.0",
  "name": "distribution",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "adminWallet",
          "type": "publicKey"
        },
        {
          "name": "callerWallet",
          "type": "publicKey"
        },
        {
          "name": "startingBlock",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateCallerAddress",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newCaller",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "mineBlock",
      "accounts": [
        {
          "name": "caller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "minedInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "blockNumber",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "caller",
            "type": "publicKey"
          },
          {
            "name": "currentReward",
            "type": "u64"
          },
          {
            "name": "halvedTimes",
            "type": "u64"
          },
          {
            "name": "lastHalvedBlockNumber",
            "type": "u64"
          },
          {
            "name": "lastMineTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "minedInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winnerAddress",
            "type": "publicKey"
          },
          {
            "name": "blockNumber",
            "type": "u64"
          },
          {
            "name": "rewardSent",
            "type": "u64"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAdmin",
      "msg": "This address is not admin wallet"
    },
    {
      "code": 6001,
      "name": "InvalidCaller",
      "msg": "This address is not caller wallet"
    },
    {
      "code": 6002,
      "name": "InvalidMiningTime",
      "msg": "Mining is not allowed within 5 minutes"
    },
    {
      "code": 6003,
      "name": "InvalidBlockNumber",
      "msg": "Passed block number is not valid"
    }
  ]
};
