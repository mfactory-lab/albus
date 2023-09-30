#!/usr/bin/make

program = albus

# Get program id by program name
program_id = $(shell sed -n 's/^ *${program}.*=.*"\([^"]*\)".*/\1/p' Anchor.toml | head -1)

# Get wallet from Anchor.toml
wallet = $(shell sed -n '/\[provider\]/,/\[/ s/^wallet[[:space:]]*=[[:space:]]*"\(.*\)"/\1/p' Anchor.toml | head -1)

# Parse args
args := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

.DEFAULT_GOAL: help

help: ## Show this help
	@printf "\033[33m%s:\033[0m\n" 'Available commands'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ----------------------------------------------------------------------------------------------------------------------

.PHONY: bump
bump: ## Bump albus program version
	cd ./programs/albus/ && cargo bump

.PHONY: build
build: ## Build program
	anchor build -p $(program)

.PHONY: test
test: ## Test program (Localnet)
	anchor test --skip-lint --provider.cluster localnet

.PHONY: sdk
sdk: ## Generate new sdk
	pnpm gen:sdk

.PHONY: deploy
deploy: build ## Deploy program
	anchor deploy -p $(program)

.PHONY: deploy-mainnet
deploy-mainnet: build ## Deploy program (Mainnet)
	anchor deploy -p $(program) --provider.cluster mainnet

.PHONY: upgrade
upgrade: build ## Upgrade program
	anchor upgrade -p $(program_id) ./target/deploy/$(program).so

.PHONY: upgrade-mainnet
upgrade-mainnet: build ## Upgrade program (Mainnet)
	anchor upgrade -p $(program_id) --provider.cluster mainnet ./target/deploy/$(program).so

.PHONY: show-buffers
show-buffers: ## Show program buffers
	solana program show --buffers -k $(wallet)

.PHONY: close-buffers
close-buffers: ## Close program buffers
	solana program close --buffers -k $(wallet)

# ----------------------------------------------------------------------------------------------------------------------

.PHONY: circom
circom: ## Build circom (e.g. make circom AgePolicy)
	circom ./circuits/$(args).circom -p bn128 -l node_modules --r1cs --wasm --sym -o ./circuits && \
	mv ./circuits/$(args)_js/$(args).wasm ./circuits/ && rm -rf ./circuits/$(args)_js

%::
	@true

