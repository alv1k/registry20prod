# Firebase Admin Scripts

These scripts help manage Firebase users and set admin permissions.

## Prerequisites

1. Firebase project with Authentication enabled
2. Service account key for Firebase Admin SDK

## Setup

1. **Get your service account key:**
   - Go to Firebase Console
   - Navigate to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in this directory
   - **IMPORTANT**: Keep this file secure and never commit it to version control

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update the service account path:**
   - Edit `setAdmin.js` and replace the path to your actual service account key file

## Available Scripts

### Set Admin Rights
To assign admin rights to a specific user:

```bash
node setAdmin.js
```

Uncomment and modify the appropriate line in the script to target the specific UID.

### Check Admin Status
To check if a user has admin rights:

```bash
node checkUser.js
```

### List All Users
To list all users with admin status:

```bash
node listUsers.js
```

## Usage Example

1. Open `setAdmin.js`
2. Find the commented lines at the bottom
3. Uncomment the line: `setCustomUserClaims('kpXIs5bBpdYsP5NKW7P1ZecgYwr2');`
4. Execute: `node setAdmin.js`

## Security Notes

- Never commit your service account key file
- Store the service account key file securely
- Only run these scripts on trusted/secure machines
- Custom claims are refreshed when the user refreshes their ID token (usually happens after re-authentication)
- Admin rights should be granted sparingly

## Troubleshooting

If you get an error about permissions:
1. Make sure your service account has the necessary Firebase Authentication permissions
2. Check that the UID you're targeting is correct
3. Ensure you're using the correct project ID in your service account key