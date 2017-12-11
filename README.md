# LearnTheChain

Built with [nextjs + socketio](https://github.com/zeit/next.js/tree/canary/examples/with-socket.io) and inspired by [this example](https://github.com/lhartikk/naivechain)

Learn the chain is a simple web app that aims to teach others about blockchain. It achieves this by demonstrating high level blockchain concepts using a simple web graphic. We attempted to convey the following points:

1. Decentralized ledger
A user can create a room that hosts a tree visible to anyone that joins the room. This tree utilizes websockets to simulate a decentralized ledger.

2. Hashing
Each node in the tree has it's own unique hash. Each following node in the tree has a previous hash attribute that points to the previous node. The chain becomes immutable through the use of these linked hashes.

3. Mining
Every person that joins the room contributes to the chain. The more people in the room, the faster the mining process proceeds.

Potential Future Features:

1. PoW
There is currently no proof of work system. Definitely an option for the future.
2. Trading
Would be nice/cool to see others able to trade with each other in addition to the current mining system
3. Privacy
How do we demonstrate private vs public keys
4. Defensibility
Perhaps including a "hacking" button to demonstrate how the chain prevents one individual from mining considerably more resources than the rest

## How to use

Install it and run:

```
$ npm install
$ [PORT=XXXX] node server.js
```
