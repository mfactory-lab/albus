#!/usr/bin/make

.DEFAULT_GOAL: help

help: ## Show this help
	@printf "\033[33m%s:\033[0m\n" 'Available commands'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ----------------------------------------------------------------------------------------------------------------------

program = albus
program_id = $(shell sed -n 's/^ *${program}.*=.*"\([^"]*\)".*/\1/p' Anchor.toml | head -1)
cluster = devnet

args := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

.PHONY: circom
circom: ## Build circom
	circom ./circuits/$(args).circom -l node_modules --r1cs --wasm --sym -o ./tmp

.PHONY: build
build: ## Build program
	anchor build -p $(program)

.PHONY: deploy
deploy: build ## Deploy program
	anchor deploy -p $(program) --provider.cluster $(cluster)

.PHONY: test
test: ## Test program
	anchor test --skip-lint --provider.cluster localnet

.PHONY: upgrade
upgrade: build ## Upgrade program
	anchor upgrade -p $(program_id) --provider.cluster $(cluster) ./target/deploy/$(program).so

%::
	@true

