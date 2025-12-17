// src/firebase/authService.ts
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import app from './config';

const auth = getAuth(app);
console.log(auth, 'test');


// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

// Sign out with enhanced cleanup
export const signOutUser = async (): Promise<void> => {
  try {
    // Clear any application-specific local storage data if needed
    // Example: localStorage.removeItem('app-specific-key');
    // Currently no app-specific data to clear
    
    // Sign out from Firebase
    await signOut(auth);
    
    // Firebase SDK handles token cleanup automatically
    console.log('User successfully signed out');
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen for auth state changes
export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};