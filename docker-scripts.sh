#!/bin/bash

# Docker development scripts for Goddess Care Co project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Development environment
dev() {
    print_status "Starting development environment..."
    check_docker
    docker-compose --profile dev up --build
}

# Production environment
prod() {
    print_status "Starting production environment..."
    check_docker
    DOCKER_BUILD=true docker-compose --profile prod up --build
}

# Run tests
test() {
    print_status "Running tests in Docker..."
    check_docker
    docker-compose --profile test up --build --abort-on-container-exit
}

# Run E2E tests
e2e() {
    print_status "Running E2E tests in Docker..."
    check_docker
    docker-compose --profile e2e up --build --abort-on-container-exit
}

# Clean up Docker resources
clean() {
    print_status "Cleaning up Docker resources..."
    check_docker
    docker-compose down -v --rmi all
    docker system prune -f
    print_success "Docker cleanup completed"
}

# Stop all services
stop() {
    print_status "Stopping all Docker services..."
    docker-compose down
    print_success "All services stopped"
}

# Show logs
logs() {
    if [ -z "$2" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$2"
    fi
}

# Build specific service
build() {
    if [ -z "$2" ]; then
        print_error "Please specify a service to build (dev, prod, test, e2e)"
        exit 1
    fi
    print_status "Building $2 service..."
    check_docker
    docker-compose build "$2"
}

# Show help
help() {
    echo "Docker development scripts for Goddess Care Co"
    echo ""
    echo "Usage: ./docker-scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev     - Start development environment with hot reloading"
    echo "  prod    - Start production environment"
    echo "  test    - Run Jest tests in Docker"
    echo "  e2e     - Run Playwright E2E tests in Docker"
    echo "  clean   - Clean up all Docker resources"
    echo "  stop    - Stop all running services"
    echo "  logs    - Show logs for all services (or specify service name)"
    echo "  build   - Build specific service (dev, prod, test, e2e)"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-scripts.sh dev"
    echo "  ./docker-scripts.sh logs app-dev"
    echo "  ./docker-scripts.sh build prod"
}

# Main script logic
case "$1" in
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    test)
        test
        ;;
    e2e)
        e2e
        ;;
    clean)
        clean
        ;;
    stop)
        stop
        ;;
    logs)
        logs "$@"
        ;;
    build)
        build "$@"
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac