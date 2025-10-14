# Firebase Cloud Functions for Sample Table App

This directory contains server-side validation functions for enhanced security.

## Setup

1. Install Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```

2. Log in to Firebase:
```bash
firebase login
```

3. Navigate to the functions directory and install dependencies:
```bash
cd functions
npm install
```

## Local Development

To run functions locally with the emulator:
```bash
npm run serve
```

## Deployment

To deploy the functions to your Firebase project:
```bash
npm run deploy
```

Or use the deploy script:
```bash
./deploy-functions.sh
```

## Functions Included

- `validateFinanceData`: Validates finance records before writing to Firestore
- `validateCorrespondentData`: Validates correspondent records before writing to Firestore
- `validateTransportData`: Validates transport records before writing to Firestore
- `validateCategoryData`: Validates category records before writing to Firestore
- `validateFinanceRecord`: Callable function for client-side validation requests

## Security Features

- Validates required fields are present
- Checks data types and value ranges
- Ensures business logic (e.g., total = price * quantity)
- Validates date formats and constraints
- Enforces authentication requirements
- Implements admin-only operations

## Configuration

Make sure your Firebase project has:
- Firestore enabled
- Cloud Functions enabled
- Proper IAM permissions for the service account