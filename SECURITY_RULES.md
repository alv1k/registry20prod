# Firestore Security Rules

These rules should be applied in your Firebase Console for proper security:

## Important: The rules below should be copied to Firebase Console
## Console URL: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all collections
    // Allow only admin user to write to all collections
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == 'kpXIs5bBpdYsP5NKW7P1ZecgYwr2';
    }
  }
}
```

This configuration ensures that:
- All authenticated users can read data (categories, records, etc.)
- Only the user with ID 'kpXIs5bBpdYsP5NKW7P1ZecgYwr2' can write/create/update/delete data

## Alternative: For a demo application (less secure but allows testing)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all users (only for demo/development)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Note:
- The first (secure) configuration requires user authentication
- The second (less secure) configuration allows access without authentication
- For production, always use the authenticated version with the specific UID
- You might need to implement more granular rules based on your specific needs