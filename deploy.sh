#!/bin/bash
# Deploy Agent Memo to Deno Deploy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           🎙️  Agent Memo - Deno Deploy${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════${NC}"
echo ""

# Check for Deno
if ! command -v deno &> /dev/null; then
    echo -e "${RED}❌ Deno not found${NC}"
    echo "Please install Deno first:"
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

echo -e "${GREEN}✅ Deno found: $(deno --version)${NC}"

# Check if we're in the agent-memo directory
if [ ! -f "server.ts" ]; then
    echo -e "${YELLOW}⚠️  server.ts not found${NC}"
    echo "Please run this script from the agent-memo directory"
    exit 1
fi

# Get project name
PROJECT_NAME=${DENO_PROJECT_NAME:-agent-memo}

# Check for token
if [ -z "$DENO_DEPLOY_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  DENO_DEPLOY_TOKEN not set${NC}"
    echo ""
    echo "To get a token:"
    echo "  1. Go to https://dash.deno.com/account"
    echo "  2. Click 'New Token'"
    echo "  3. Copy the token"
    echo ""
    read -p "Enter your Deno Deploy token: " -s DENO_DEPLOY_TOKEN
    echo ""
fi

if [ -z "$DENO_DEPLOY_TOKEN" ]; then
    echo -e "${RED}❌ DENO_DEPLOY_TOKEN is required${NC}"
    exit 1
fi

# Get TTS mode
TTS_MODE=${TTS_MODE:-simulation}
echo -e "${GREEN}🔊 TTS Mode: $TTS_MODE${NC}"

# Get ElevenLabs API key (optional)
if [ "$TTS_MODE" = "elevenlabs" ]; then
    if [ -z "$ELEVENLABS_API_KEY" ]; then
        read -p "Enter ElevenLabs API key (or press Enter to skip): " -s ELEVENLABS_API_KEY
        echo ""
    fi
fi

# Build deployment command
DEPLOY_CMD="deno deploy --project=$PROJECT_NAME --token=$DENO_DEPLOY_TOKEN"

# Add TTS mode
DEPLOY_CMD="$DEPLOY_CMD --env=TTS_MODE=$TTS_MODE"

# Add ElevenLabs API key if provided
if [ -n "$ELEVENLABS_API_KEY" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --env=ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY"
fi

# Add server file
DEPLOY_CMD="$DEPLOY_CMD server.ts"

echo ""
echo -e "${YELLOW}Deploying...${NC}"
echo ""

# Deploy
if eval $DEPLOY_CMD; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "═════════════════════════════════════════════════════════"
    echo "📍 API:     https://$PROJECT_NAME.deno.dev"
    echo "🔊 TTS:     $TTS_MODE"
    echo "📚 Health:  https://$PROJECT_NAME.deno.dev/health"
    echo "🎤 Voices:  https://$PROJECT_NAME.deno.dev/voices"
    echo "═════════════════════════════════════════════════════════"
    echo ""
    echo -e "${GREEN}💡 Try it now:${NC}"
    echo "  curl https://$PROJECT_NAME.deno.dev/health"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  • Check your token: https://dash.deno.com/account"
    echo "  • Verify project name exists"
    echo "  • Check TypeScript errors: deno check server.ts"
    echo ""
    exit 1
fi