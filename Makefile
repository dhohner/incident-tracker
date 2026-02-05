SHELL := /bin/sh

-include .env.local
export

IMAGE ?= incident-tracker

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  help     Show this help"
	@echo "  build    Build the Docker image"
	@echo "  run      Run the Docker image locally"
	@echo "  rebuild  Build then run"

.PHONY: build
build:
	@if [ -z "$(CONVEX_DEPLOYMENT)" ]; then \
		echo "CONVEX_DEPLOYMENT is not set. Add it to .env.local or pass it via CONVEX_DEPLOYMENT=..."; \
		exit 1; \
	fi
	@if [ -z "$(CONVEX_DEPLOY_KEY)" ]; then \
		echo "CONVEX_DEPLOY_KEY is not set. Create a deploy key and add it to .env.local or pass it via CONVEX_DEPLOY_KEY=..."; \
		exit 1; \
	fi
	@if [ -z "$(VITE_CONVEX_URL)" ]; then \
		echo "VITE_CONVEX_URL is not set. Add it to .env.local or pass it via VITE_CONVEX_URL=..."; \
		exit 1; \
	fi
	@CONVEX_DEPLOYMENT="$(CONVEX_DEPLOYMENT)" \
	CONVEX_DEPLOY_KEY="$(CONVEX_DEPLOY_KEY)" \
	DOCKER_BUILDKIT=1 docker build --build-arg CONVEX_DEPLOYMENT="$(CONVEX_DEPLOYMENT)" --build-arg VITE_CONVEX_URL="$(VITE_CONVEX_URL)" --build-arg VITE_CONVEX_SITE_URL="$(VITE_CONVEX_SITE_URL)" --secret id=convex_deploy_key,env=CONVEX_DEPLOY_KEY -t "$(IMAGE)" .

.PHONY: run
run:
	@if [ ! -f .env.local ]; then \
		echo ".env.local not found. Create it or pass envs manually."; \
		exit 1; \
	fi
	docker run --rm --env-file .env.local -p 3000:3000 $(IMAGE)

.PHONY: rebuild
rebuild: build run
