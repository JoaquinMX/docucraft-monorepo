import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { z } from "zod";

const firebaseEnvSchema = z.object({
  PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1, "PUBLIC_FIREBASE_API_KEY is required"),
  PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "PUBLIC_FIREBASE_PROJECT_ID is required"),
  PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "PUBLIC_FIREBASE_STORAGE_BUCKET is required"),
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required"),
  PUBLIC_FIREBASE_APP_ID: z
    .string()
    .min(1, "PUBLIC_FIREBASE_APP_ID is required"),
  PUBLIC_FIREBASE_MEASUREMENT_ID: z
    .string()
    .min(1, "PUBLIC_FIREBASE_MEASUREMENT_ID is required"),
});

const env = firebaseEnvSchema.parse(import.meta.env);

const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID,
  measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
