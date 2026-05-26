# Solidity Practice — Hardhat

![Solidity](https://img.shields.io/badge/-Solidity-363636?logo=solidity&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Ethereum](https://img.shields.io/badge/-Ethereum-3C3C3D?logo=ethereum&logoColor=white)
![Hardhat](https://img.shields.io/badge/-Hardhat-FFF100?logo=hardhat&logoColor=black)
[![Stars](https://img.shields.io/github/stars/0pFlow/solidity-practice-hardhat?style=flat)](https://github.com/0pFlow/solidity-practice-hardhat/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/0pFlow/solidity-practice-hardhat)](https://github.com/0pFlow/solidity-practice-hardhat/commits/main)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A collection of small Solidity smart contracts written as practice exercises while learning Ethereum development. The project is bootstrapped with **Hardhat 3** and uses **TypeScript** for configuration, scripts, and tests (Mocha + ethers v6), alongside Foundry-compatible Solidity tests.

## Contracts

All contracts live in [`contracts/`](./contracts) and target Solidity `^0.8.28` / `0.8.31`.

| Contract | Description |
| --- | --- |
| [`HelloWorld.sol`](./contracts/HelloWorld.sol) | Minimal starter contract that stores a `string message` and exposes a getter and setter — a classic Solidity "hello world". |
| [`Counter.sol`](./contracts/Counter.sol) | Public `uint` counter with `inc()` and `incBy(uint)` functions, emitting an `Increment` event on each update. |
| [`CustomErrors.sol`](./contracts/CustomErrors.sol) | Demonstrates Solidity custom errors (`NotOwner`, `TooLow`) for gas-efficient reverts in an owner-restricted `setNumber` function. |
| [`AccessControl.sol`](./contracts/AccessControl.sol) | Simple role-based access control using `admin`, `supporter`, and `member` mappings, with an `onlyAdmin` modifier and a `RoleAssigned` event. |
| [`Wallet.sol`](./contracts/Wallet.sol) | ETH wallet that tracks per-address balances, supports deposits via `receive()`, enforces a 1 ETH withdrawal cap, and protects against reentrancy with a lock modifier. |
| [`RewardSystem.sol`](./contracts/RewardSystem.sol) | Membership and loyalty-points system: members can join, earn, transfer, and redeem points for rewards (`VIP`, `TICKETS`, `HOODIES`). Uses custom errors, admin-only grants, and explicitly rejects incoming ETH. |

A Foundry-style Solidity test for the counter is included as [`contracts/Counter.t.sol`](./contracts/Counter.t.sol).

## Tech Stack

- **Solidity** `0.8.28` / `0.8.31`
- **Hardhat 3** — development environment, compiler, and runner
- **TypeScript** — config, scripts, and integration tests
- **Mocha + Chai** — TypeScript test runner and assertions
- **ethers.js v6** — Ethereum interactions in tests and scripts
- **Hardhat Ignition** — declarative deployments
- **OpenZeppelin Contracts** — reusable building blocks
- **forge-std** — Foundry-compatible Solidity testing utilities

See [`package.json`](./package.json) for exact versions.

## Prerequisites

- [Node.js](https://nodejs.org/) **18+** (Node 20 LTS recommended)
- [npm](https://www.npmjs.com/) (ships with Node.js)
- Git

## Getting Started

### 1. Clone the repository

```shell
git clone https://github.com/0pFlow/solidity-practice-hardhat.git
cd solidity-practice-hardhat
```

### 2. Install dependencies

```shell
npm install
```

### 3. Compile the contracts

```shell
npx hardhat compile
```

### 4. Run the tests

Run every test (both Solidity and Mocha):

```shell
npx hardhat test
```

Or run them selectively:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

## Deployment (optional)

The project ships with an example Hardhat Ignition module for the `Counter` contract.

Deploy to a local simulated chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

Deploy to Sepolia (requires a funded account). Set the `SEPOLIA_PRIVATE_KEY` configuration variable via the `hardhat-keystore` plugin:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

> Never commit private keys. Use `hardhat-keystore` or environment variables.

## Project Structure

```
.
├── contracts/         # Solidity smart contracts (+ Foundry-style .t.sol tests)
├── ignition/          # Hardhat Ignition deployment modules
├── scripts/           # TypeScript scripts
├── test/              # Mocha + ethers integration tests
├── hardhat.config.ts  # Hardhat configuration
├── tsconfig.json      # TypeScript configuration
└── package.json
```

## License

Contracts are individually marked with `SPDX-License-Identifier` headers (mostly **MIT**). See each file for details.
