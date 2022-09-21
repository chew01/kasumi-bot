# Kasumi Bot Project

This is Milestone 2 of the Kasumi Bot Project by kitsuiro.

### Features

- Economy and Inventory
- Daily login (`/login`) and two job commands (`/fish` `/mine`)
- Gambling commands ( `/blackjack` `/coinflip` `/roulette` `/slots`)
- Message activity income (Certain channels can be configured to give coins for messages)
- Shop (`/shop`) and trade (`/trade`) commands
- EXP system with rank support
- Badword filter (`/badword`)
- Anti-Raid module
- Poised for future expansion and EXTREMELY customisable!

### Prerequisites

- [Node 16.14.0 and above](https://nodejs.org)

### Usage
1. Install the prerequisites, including a package manager of your choice (this guide uses [npm](https://www.npmjs.com/))
2. Run `npm install` to install dependencies
3. Edit .env.example file and rename it to .env
4. Change any variable to your liking inside the JSON files inside the config folder
5. Run the bot with `npm run bot`

### Usage with Docker
1. Install [Docker Engine and Docker Compose](https://docs.docker.com/engine/install/)
2. Edit .env.example file and rename it to .env
3. Change any variable to your liking inside the JSON files inside the config folder
4. Start the docker container with `npm run docker`

To run the bot in development watch mode (restart on every change), use `npm run watch`
