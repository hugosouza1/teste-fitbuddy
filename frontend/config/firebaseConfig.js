import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_APIKEY,
  authDomain: Constants.expoConfig.extra.FIREBASE_AUTHDOMAIN,
  projectId: Constants.expoConfig.extra.FIREBASE_PROJECTID,
  storageBucket: Constants.expoConfig.extra.FIREBASE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.FIREBASE_MESSAGINGSENDERID,
  appId: Constants.expoConfig.extra.FIREBASE_APPID,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);