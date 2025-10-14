# Sample Table Application

This is a sample table application built with React, TypeScript, and Firebase.

## Features
- Financial record management
- Transport record management
- Correspondent record management
- Data visualization with charts
- Responsive design for mobile and desktop
- Role-based access control (admin/non-admin users)

## Security Notice

**⚠️ Critical Security Warning ⚠️**

A service account key was accidentally committed to this repository. While the key has been removed from the git history and the repository, you MUST:

1. **Invalidate the compromised key immediately** in Google Cloud Console
2. Generate a new service account key if needed
3. Never commit credentials to version control

**Security Best Practices:**
- All service account keys should be stored in environment variables
- Add `*serviceAccountKey*.json` patterns to `.gitignore`
- Regularly rotate keys (recommended every 90 days)
- Enable key expiration dates in Google Cloud
- Use Firebase Admin SDK with proper IAM permissions

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase project
4. Configure environment variables (see `.env.example`)
5. Deploy to Firebase: `npm run deploy`

## Available Scripts

- `npm start` - Run development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App
- `npm run deploy` - Deploy to Firebase

## Technologies Used

- React with TypeScript
- Firebase (Firestore, Authentication, Functions)
- Tailwind CSS for styling
- Recharts for data visualization
- Zustand for state management

## Contributing

Please follow standard security practices when contributing:
- Never commit credentials or keys
- Review code for security vulnerabilities
- Keep dependencies updated
- Follow clean code principles