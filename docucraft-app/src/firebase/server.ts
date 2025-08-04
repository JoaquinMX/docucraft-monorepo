import type { ServiceAccount } from "firebase-admin";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const activeApps = getApps();
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || import.meta.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || import.meta.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || import.meta.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID || import.meta.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || import.meta.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI || import.meta.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL || import.meta.env.FIREBASE_AUTH_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || import.meta.env.FIREBASE_CLIENT_CERT_URL,
};

const initApp = () => {
  console.info("Loading service account from environment variables.");

  // Debug: Log environment variable availability
  console.info("Environment variables check:", {
    FIREBASE_PROJECT_ID: (process.env.FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID)
      ? "✅ Set"
      : "❌ Missing",
    FIREBASE_PRIVATE_KEY_ID: (process.env.FIREBASE_PRIVATE_KEY_ID || import.meta.env.FIREBASE_PRIVATE_KEY_ID)
      ? "✅ Set"
      : "❌ Missing",
    FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || import.meta.env.FIREBASE_PRIVATE_KEY)
      ? "✅ Set"
      : "❌ Missing",
    FIREBASE_CLIENT_EMAIL: (process.env.FIREBASE_CLIENT_EMAIL || import.meta.env.FIREBASE_CLIENT_EMAIL)
      ? "✅ Set"
      : "❌ Missing",
  });

  // Debug: Log the actual project_id value (safely)
  console.info(
    "project_id value:",
    JSON.stringify(process.env.FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID)
  );

  return initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
};

export const app = activeApps.length === 0 ? initApp() : activeApps[0];
