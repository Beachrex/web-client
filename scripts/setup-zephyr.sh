#!/bin/bash

# Zephyr Scale Setup Script for Playwright
# This script helps you set up Zephyr Scale integration

echo "🚀 Zephyr Scale Integration Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists."
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Please edit .env.local manually."
        exit 1
    fi
fi

# Get Jira Project Key
echo ""
echo "📋 Step 1: Jira Project Key"
echo "Find this in your Jira project URL:"
echo "Example: https://yourdomain.atlassian.net/jira/software/projects/QA"
echo "The project key is 'QA' in this example"
echo ""
read -p "Enter your Jira Project Key (e.g., QA, TEST, BEACH): " PROJECT_KEY

# Validate project key format
if [[ ! $PROJECT_KEY =~ ^[A-Z][A-Z0-9_]*$ ]]; then
    echo "❌ Invalid project key format. Must be uppercase letters, numbers, and underscores only."
    exit 1
fi

# Get Zephyr API Token
echo ""
echo "🔑 Step 2: Zephyr Scale API Token"
echo "Generate this from:"
echo "Jira Settings > Apps > Zephyr Scale API Access Tokens"
echo ""
read -p "Enter your Zephyr Scale API Token: " API_TOKEN

if [ -z "$API_TOKEN" ]; then
    echo "❌ API Token cannot be empty."
    exit 1
fi

# Create .env.local file
echo ""
echo "📝 Creating .env.local file..."
cat > .env.local << EOF
# Zephyr Scale Configuration
# Generated on $(date)

# Your Jira Project Key
ZEPHYR_PROJECT_KEY=$PROJECT_KEY

# Zephyr Scale API Token
ZEPHYR_AUTH_TOKEN=$API_TOKEN
EOF

echo "✅ .env.local file created successfully!"
echo ""

# Ask if user wants to enable Zephyr reporter now
echo "🔧 Step 3: Enable Zephyr Reporter"
echo ""
read -p "Do you want to enable the Zephyr reporter in playwright.config.ts now? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Please uncomment the Zephyr reporter section in playwright.config.ts manually."
    echo "Look for the commented section starting with:"
    echo "  // ['playwright-zephyr/lib/src/cloud', {"
    echo ""
fi

# Summary
echo ""
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. ✅ Environment variables configured in .env.local"
echo "2. 📝 Uncomment the Zephyr reporter in playwright.config.ts"
echo "3. 🏷️  Add test case IDs to your tests (e.g., [${PROJECT_KEY}-001])"
echo "4. 🧪 Run tests: yarn test:e2e"
echo "5. 📊 Check results in Zephyr Scale"
echo ""
echo "📖 For detailed instructions, see ZEPHYR_INTEGRATION.md"
echo ""

