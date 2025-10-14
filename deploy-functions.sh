#!/bin/bash
# deploy-functions.sh

echo "Installing functions dependencies..."
cd functions
npm install

echo "Building functions..."
npm run build

echo "Deploying functions..."
firebase deploy --only functions

echo "Functions deployed successfully!"