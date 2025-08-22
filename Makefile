# Define variables for easier command management
DOCKER_COMPOSE := docker compose
# Correct the path to the backend dependency's Makefile
DEPS_MAKE := $(MAKE) -C deps/bilitioo-backend

# ==============================================================================
# Main Targets
# ==============================================================================
# Default target: Executed when you run `make`
# This will download dependencies, run their makefile, then build and run the frontend.
all: get-dep run-dep-makefile build up

# ==============================================================================
# Lifecycle Commands
# ==============================================================================
# Build and start the container
up: build
	@echo "Starting the frontend container..."
	$(DOCKER_COMPOSE) up -d

# Build the docker image
build:
	@echo "Building the frontend Docker image..."
	$(DOCKER_COMPOSE) build

# Stop and remove the container and its volumes
down:
	@echo "Stopping and removing the frontend container..."
	$(DOCKER_COMPOSE) down -v --remove-orphans

# View logs in real-time
logs:
	@echo "Following frontend logs..."
	$(DOCKER_COMPOSE) logs -f

# A full reset: stops and removes the container, then starts it again.
reset: down up

# ==============================================================================
# Dependency Management
# ==============================================================================
# Run the get-dep script to download external dependencies
get-dep:
	@echo "Getting dependencies..."
	chmod +x bin/get-dep
	./bin/get-dep

# Run the makefile of the downloaded dependency
# This assumes the dependency is downloaded into a 'deps/bilitioo-backend' directory.
run-dep-makefile:
	@echo "Running dependency's Makefile..."
	$(DEPS_MAKE) all

# Define phony targets to prevent conflicts with files of the same name
.PHONY: all up build down logs reset get-dep run-dep-makefile
