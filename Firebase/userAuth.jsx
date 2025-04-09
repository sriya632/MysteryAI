// src/Firebase/userAuth.jsx
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    onAuthStateChanged,
    getAuth
  } from "firebase/auth";
  import { initializeApp } from "firebase/app";
  import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
  
  // Firebase configuration (same as your existing config)
  const firebaseConfig = {
      apiKey: "AIzaSyAPPv3XYZW26dlicnpwUUYcgWlrfbxNIj8",
      authDomain: "mysteryai-46907.firebaseapp.com",
      projectId: "mysteryai-46907",
      storageBucket: "mysteryai-46907.firebasestorage.app",
      messagingSenderId: "415359645504",
      appId: "1:415359645504:web:2b21c63d87bef26782eca5",
      measurementId: "G-8GV2348PB2"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  
  // Register new user
  // In src/Firebase/userAuth.js
export const registerUser = async (email, password, username) => {
    try {
      // Validate password length
      if (password.length < 6) {
        return { 
          user: null, 
          error: "Password should be at least 6 characters" 
        };
      }
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // Create user document in separate "userDetails" collection
      await setDoc(doc(db, "userDetails", userCredential.user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
        stats: {
          gamesPlayed: 0,
          wins: 0,
          totalSolveTime: 0
        }
      });
      
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error("Registration error:", error.code, error.message);
      
      // Handle specific Firebase auth errors
      switch(error.code) {
        case 'auth/email-already-in-use':
          return { user: null, error: "Email already in use" };
        case 'auth/invalid-email':
          return { user: null, error: "Invalid email format" };
        case 'auth/weak-password':
          return { user: null, error: "Password is too weak" };
        case 'auth/operation-not-allowed':
          return { user: null, error: "Email/password accounts are not enabled in Firebase console" };
        default:
          return { user: null, error: error.message };
      }
    }
  };
  
  // Sign in existing user
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };
  
  // Sign out user
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };
  
  // Get user profile from userDetails collection
  export const getUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "userdetails", userId));
      if (userDoc.exists()) {
        return { profile: userDoc.data(), error: null };
      } else {
        return { profile: null, error: "User profile not found" };
      }
    } catch (error) {
      return { profile: null, error: error.message };
    }
  };
  
  // Listen for auth state changes
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };