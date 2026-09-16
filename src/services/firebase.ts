import { initializeApp } from "firebase/app";

import {
    getReactNativePersistence,
    initializeAuth
} from "firebase/auth";


import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: "imarati-2953c.firebaseapp.com",
    projectId: "imarati-2953c",
    storageBucket: "imarati-2953c.firebasestorage.app",
    messagingSenderId: "1073125329195",
    appId: "1:1073125329195:web:5f39db661695fa15ee5d6e",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export const storage = getStorage(app);