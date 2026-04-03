.PHONY: all build run test lint clean docker-up docker-down tidy

# Variables
APP_NAME=diary-management
MAIN_PATH=./cmd/server/main.go

## help: Show this help message
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build        Build the application"
	@echo "  run          Run the application"
	@echo "  test         Run tests"
	@echo "  test-cover   Run tests with coverage"
	@echo "  lint         Run linter"
	@echo "  tidy         Tidy Go modules"
	@echo "  clean        Clean build artifacts"
	@echo "  docker-up    Start Docker containers"
	@echo "  docker-down  Stop Docker containers"
	@echo "  migrate      Run database migrations"

## build: Build the application binary
build:
	@echo "🔨 Building $(APP_NAME)..."
	go build -o bin/$(APP_NAME) $(MAIN_PATH)
	@echo "✅ Build complete: bin/$(APP_NAME)"

## run: Run the application
run:
	@echo "🚀 Starting $(APP_NAME)..."
	go run $(MAIN_PATH)

## test: Run all tests
test:
	@echo "🧪 Running tests..."
	go test -v ./...

## test-cover: Run tests with coverage report
test-cover:
	@echo "🧪 Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "📊 Coverage report: coverage.html"

## lint: Run golangci-lint
lint:
	@echo "🔍 Running linter..."
	golangci-lint run ./...

## tidy: Tidy Go modules
tidy:
	@echo "📦 Tidying modules..."
	go mod tidy

## clean: Remove build artifacts
clean:
	@echo "🧹 Cleaning..."
	rm -rf bin/
	rm -f coverage.out coverage.html
	@echo "✅ Clean complete"

## docker-up: Start all Docker containers
docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose up -d --build
	@echo "✅ Containers started"

## docker-down: Stop all Docker containers
docker-down:
	@echo "🐳 Stopping Docker containers..."
	docker-compose down
	@echo "✅ Containers stopped"

## docker-logs: View Docker logs
docker-logs:
	docker-compose logs -f

## migrate: Run database migration manually
migrate:
	@echo "📂 Running migrations..."
	docker-compose exec postgres psql -U postgres -d diary_db -f /docker-entrypoint-initdb.d/001_init.sql
