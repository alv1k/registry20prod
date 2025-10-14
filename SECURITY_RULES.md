# Firestore Security Rules

These rules should be applied in your Firebase Console for proper security:

## Important: The rules below should be copied to Firebase Console
## Console URL: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all users (authenticated and unauthenticated) to read all collections
    // Allow only admin user to write to all collections
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == 'kpXIs5bBpdYsP5NKW7P1ZecgYwr2';
    }
  }
}
```

This configuration ensures that:
- All users (authenticated and unauthenticated) can read data (categories, records, etc.)
- Only the user with ID 'kpXIs5bBpdYsP5NKW7P1ZecgYwr2' can write/create/update/delete data

## Note:
- Read access is public (allows anyone to view data)
- Write access is restricted to the admin user only
- This provides a good balance between accessibility and security
- For production with sensitive data, consider requiring authentication for read access as well