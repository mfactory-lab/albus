#!/usr/bin/make

.DEFAULT_GOAL: help
.PHONY: build bump test test-unit

NETWORK ?= devnet
PROGRAM ?= albus

CIRCUITS_PATH ?= ./packages/circuits

# Get the program ID by program name from the Anchor.toml file
program_id = $(shell sed -n 's/^ *${PROGRAM}.*=.*"\([^"]*\)".*/\1/p' Anchor.toml | head -1)

# Get wallet address from the Anchor.toml file
wallet = $(shell sed -n '/\[provider\]/,/\[/ s/^wallet[[:space:]]*=[[:space:]]*"\(.*\)"/\1/p' Anchor.toml | head -1)

help: ## Show this help
	@printf "\033[33m%s:\033[0m\n" 'Available commands'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ----------------------------------------------------------------------------------------------------------------------

bump: ## Bump program version
	cd ./programs/$(PROGRAM)/ && cargo bump

build: ## Build program
ifeq ($(NETWORK), devnet)
	anchor build -p $(PROGRAM) --arch sbf -- --features devnet
else
	anchor build -p $(PROGRAM) --arch sbf
endif

test: ## Test integration (localnet)
	anchor test --arch sbf --skip-lint --provider.cluster localnet -- --features testing

test-unit: ## Test unit
	cargo clippy --all-features -- --allow clippy::result_large_err
	cargo test --all-features

sdk: ## Generate new sdk
	pnpm -F @albus-finance/sdk generate

deploy: build ## Deploy program
	anchor deploy -p $(PROGRAM) --provider.cluster $(NETWORK)
#	--program-keypair ./target/deploy/$(PROGRAM)-keypair-$(NETWORK).json

upgrade: build ## Upgrade program
	anchor upgrade -p $(program_id) --provider.cluster $(NETWORK) ./target/deploy/$(PROGRAM).so

show-buffers: ## Show program buffers
	solana program show --buffers -k $(wallet) -u $(NETWORK)

close-buffers: ## Close program buffers
	solana program close --buffers -k $(wallet) -u $(NETWORK)

clean:
	rm -rf node_modules target .anchor

#ifneq ($(NETWORK), $(shell cat target/network_changed 2>/dev/null))
##force update of target/network_changed if value of NETWORK changed from last time
#.PHONY: target/network_changed
#endif
#target/network_changed:
#	echo $(NETWORK) > target/network_changed

# ----------------------------------------------------------------------------------------------------------------------

# Parse args
args := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

circom: ## Build circom (e.g. make circom AgePolicy)
	circom $(CIRCUITS_PATH)/$(args).circom -p bn128 -l node_modules --r1cs --wasm --sym -o $(CIRCUITS_PATH) && \
	mv $(CIRCUITS_PATH)/$(args)_js/$(args).wasm $(CIRCUITS_PATH)/ && \
	rm -rf $(CIRCUITS_PATH)/$(args)_js

%::
	@true

