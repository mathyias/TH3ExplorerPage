# TH3ExplorerPage

Frontend explorer for TH3Chain.

## Live site

https://explorer.th3chain.cloud

## Features

- Latest blocks
- Block lookup by height or hash
- Transaction lookup
- Address lookup
- Balance display
- UTXO display
- Rich address history
- Mining reward visibility
- Links between blocks, transactions and addresses

## API dependency

The explorer frontend reads data from:

https://api.th3chain.cloud

## Main endpoints

- /api/network
- /api/latest-blocks
- /api/block-height/:height
- /api/block/:hash
- /api/tx/:txid
- /api/address/:address
- /api/address/:address/utxos
- /api/address/:address/history

## Repository

Static frontend deployed through Cloudflare Pages.
