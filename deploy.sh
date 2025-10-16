#!/bin/bash

# Deployment script for caspercooks.tech on Mikrus
# Usage: ./deploy.sh
#
# IMPORTANT: Set RESEND_API_KEY before deploying:
#   export RESEND_API_KEY=your_resend_api_key
#   ./deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Check if RESEND_API_KEY is set
if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ Error: RESEND_API_KEY environment variable is not set"
    echo "Please set it before deploying:"
    echo "  export RESEND_API_KEY=your_resend_api_key"
    echo "  ./deploy.sh"
    exit 1
fi

# Configuration - UPDATE THESE VALUES
SSH_HOST="patryk176.mikrus.xyz"
SSH_USER="root"
SSH_PORT="10176"
CONTAINER_NAME="caspercooks-tech"
IMAGE_NAME="caspercooks-tech"
APP_PORT="3000"
EXTERNAL_PORT="3000"  # Port on server

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building Docker image for linux/amd64...${NC}"
docker build --platform linux/amd64 -t $IMAGE_NAME:latest .

echo -e "${BLUE}💾 Saving Docker image to tar...${NC}"
docker save $IMAGE_NAME:latest | gzip > ${IMAGE_NAME}.tar.gz

echo -e "${BLUE}📤 Uploading image to server...${NC}"
scp -P $SSH_PORT -o StrictHostKeyChecking=accept-new ${IMAGE_NAME}.tar.gz ${SSH_USER}@${SSH_HOST}:~

echo -e "${BLUE}🔧 Deploying on server...${NC}"
ssh -p $SSH_PORT -o StrictHostKeyChecking=accept-new ${SSH_USER}@${SSH_HOST} << ENDSSH
    # Load the image
    echo "Loading Docker image..."
    gunzip ~/caspercooks-tech.tar.gz
    sudo docker load -i ~/caspercooks-tech.tar

    # Stop and remove old container if exists
    echo "Stopping old container..."
    sudo docker stop caspercooks-tech 2>/dev/null || true
    sudo docker rm caspercooks-tech 2>/dev/null || true

    # Run new container with environment variables
    echo "Starting new container..."
    sudo docker run -d \
        --name caspercooks-tech \
        --restart unless-stopped \
        -p 3000:3000 \
        -e RESEND_API_KEY="${RESEND_API_KEY}" \
        caspercooks-tech:latest

    # Cleanup
    echo "Cleaning up..."
    rm ~/caspercooks-tech.tar
    sudo docker image prune -f

    echo "✅ Deployment complete!"
    sudo docker ps | grep caspercooks-tech
ENDSSH

# Cleanup local tar file
rm ${IMAGE_NAME}.tar.gz

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}Your app is now running on http://${SSH_HOST}:${EXTERNAL_PORT}${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Configure nginx/caddy reverse proxy for caspercooks.tech"
echo "  2. Set up SSL certificate with certbot"
echo "  3. Point your domain DNS to the server IP"
