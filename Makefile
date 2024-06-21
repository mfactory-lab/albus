#!/usr/bin/make

.DEFAULT_GOAL: help
.PHONY: build bump test

ENV ?= dev # dev, stage, prod
PROGRAM ?= albus
PROGRAM_KEYPAIR ?= ./target/deploy/$(PROGRAM)-keypair.json

ifeq ($(ENV),prod)
	# The `prod` environment uses its own keypair
	PROGRAM_KEYPAIR = ./target/deploy/$(PROGRAM)-keypair-prod.json
	BUILD_FEATURES = mainnet
	CLUSTER = mainnet
	SOLANA_CLUSTER ?= mainnet-beta
else ifeq ($(ENV),stage)
	CLUSTER = mainnet
	SOLANA_CLUSTER ?= mainnet-beta
else
	BUILD_FEATURES = devnet
	CLUSTER = devnet
	SOLANA_CLUSTER ?= devnet
endif

# Get the program ID by program name from the Anchor.toml file
PROGRAM_ID = $(shell sed -n '/\[programs.${CLUSTER}\]/,/\[/ s/^${PROGRAM} *= *"\(.*\)"/\1/p' Anchor.toml | head -1)

# Get wallet address from the Anchor.toml file
WALLET = $(shell sed -n '/\[provider\]/,/\[/ s/^wallet[[:space:]]*=[[:space:]]*"\(.*\)"/\1/p' Anchor.toml | head -1)

help: ## Show this help
	@printf "\033[33m%s:\033[0m\n" 'Available commands'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ----------------------------------------------------------------------------------------------------------------------

info: ## Info
	@echo "ENV: $(ENV)"
	@echo "CLUSTER: $(CLUSTER)"
	@echo "SOLANA_CLUSTER: $(SOLANA_CLUSTER)"
	@echo "PROGRAM_ID: $(PROGRAM_ID)"
	@echo "PROGRAM_KEYPAIR: $(PROGRAM_KEYPAIR)"
	@echo "BUILD_FEATURES: $(BUILD_FEATURES)"
	@echo "WALLET: $$(solana address -k $(WALLET))"
	@echo "Balance: $$(solana balance -k $(WALLET) -u $(SOLANA_CLUSTER))"

sdk: build ## Generate new sdk
	pnpm -F @albus-finance/sdk generate
	pnpm eslint ./packages/albus-sdk/src/generated --fix

bump: ## Bump program version
	cd ./programs/$(PROGRAM)/ && cargo bump

build: ## Build program
	anchor build -p $(PROGRAM) -- --features "$(BUILD_FEATURES)"

test: ## Test integration (localnet)
	anchor test --skip-lint --provider.cluster localnet -- --features testing

test-unit: ## Test unit
	cargo clippy --all-features -- --allow clippy::result_large_err
	cargo test --all-features

deploy: build ## Deploy program
	anchor deploy -p $(PROGRAM) --provider.cluster $(CLUSTER) --program-keypair $(PROGRAM_KEYPAIR)

upgrade: build ## Upgrade program
	solana program deploy -u $(SOLANA_CLUSTER) --upgrade-authority $(WALLET) --program-id $(PROGRAM_ID) \
		--max-sign-attempts 200 \
		--with-compute-unit-price 25000 \
		./target/deploy/$(PROGRAM).so
	#anchor deploy -p $(PROGRAM) --provider.cluster $(CLUSTER) -- \
#        --upgrade-authority $(WALLET) \
#        --max-sign-attempts 100 \
#        --with-compute-unit-price 71428
	#anchor upgrade -p $(PROGRAM_ID) --provider.cluster $(SOLANA_CLUSTER) ./target/deploy/$(PROGRAM).so

recover: ## Continue upgrade program
	solana program deploy -u $(SOLANA_CLUSTER) \
		--buffer ./recover.json \
		--upgrade-authority $(WALLET) \
		--program-id $(PROGRAM_ID) \
		./target/deploy/$(PROGRAM).so

verify: build ## Verify program
	anchor verify $(PROGRAM_ID) --provider.cluster $(CLUSTER)

show-buffers: ## Show program buffers
	solana program show --buffers -k $(WALLET) -u $(SOLANA_CLUSTER)

close-buffers: ## Close program buffers
	solana program close --buffers -k $(WALLET) -u $(SOLANA_CLUSTER)

clean:
	rm -rf node_modules target .anchor

spool-build: ## Build stake pool
	cd ./programs/albus-stake-pool/ && cargo build-sbf

spool-deploy: ## Deploy stake pool
	solana program deploy -u $(SOLANA_CLUSTER) --upgrade-authority $(WALLET) ./target/deploy/albus_stake_pool.so

#ifneq ($(NETWORK), $(shell cat target/network_changed 2>/dev/null))
##force update of target/network_changed if value of NETWORK changed from last time
#.PHONY: target/network_changed
#endif
#target/network_changed:
#	echo $(NETWORK) > target/network_changed

%::
	@true

