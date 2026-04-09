.PHONY: help install build clean pack distribute lint

# Default target
help:
	@echo "Funny Bone Chrome Extension - Available Commands"
	@echo ""
	@echo "  make install      Install dependencies (npm packages)"
	@echo "  make build        Build/pack extension into .crx file"
	@echo "  make clean        Remove build artifacts (.crx files)"
	@echo "  make pack         Alias for build"
	@echo "  make distribute   Build and prepare for distribution"
	@echo "  make dev          Watch mode (requires nodemon, use for development)"
	@echo "  make lint         Lint JavaScript files"
	@echo "  make help         Show this help message"
	@echo ""
	@echo "Note: Keep key.pem safe - it's used to sign all releases"
	@echo ""

# Install npm dependencies
install:
	npm install

# Build the .crx package
build:
	@echo "📦 Building extension..."
	npx crx pack . -o funny-bone.crx
	@echo "✅ Built: funny-bone.crx"
	@ls -lh funny-bone.crx

# Alias for build
pack: build

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f funny-bone.crx
	@echo "✅ Cleaned"

# Build and show distribution info
distribute: clean build
	@echo ""
	@echo "📤 Ready to Distribute"
	@echo "=================================="
	@echo "File: funny-bone.crx"
	@ls -lh funny-bone.crx
	@echo ""
	@echo "Distribution methods:"
	@echo "1. Email the .crx file directly"
	@echo "2. Host on a file server"
	@echo "3. Share via cloud storage (Drive, Dropbox, etc.)"
	@echo ""
	@echo "Installation: Users drag & drop .crx into chrome://extensions/"
	@echo ""

# Lint JavaScript files
lint:
	@echo "🔍 Linting JavaScript files..."
	npx eslint src/ 2>/dev/null || echo "⚠️  ESLint not configured (optional)"

# Development mode (requires nodemon)
dev:
	@echo "👀 Watching for changes..."
	@command -v nodemon >/dev/null 2>&1 || { echo "nodemon not installed. Run: npm install --save-dev nodemon"; exit 1; }
	nodemon --exec "make build" --watch src --watch manifest.json --ext js,json,html,css

# Verify project structure
verify:
	@echo "✅ Checking project structure..."
	@test -f manifest.json && echo "  ✓ manifest.json" || echo "  ✗ manifest.json"
	@test -d src && echo "  ✓ src/" || echo "  ✗ src/"
	@test -d assets && echo "  ✓ assets/" || echo "  ✗ assets/"
	@test -f README.md && echo "  ✓ README.md" || echo "  ✗ README.md"
	@test -f key.pem && echo "  ✓ key.pem (signing key)" || echo "  ✗ key.pem (missing!)"
	@echo "✅ Project structure verified"
