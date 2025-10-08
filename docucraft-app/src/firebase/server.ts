import type { App, ServiceAccount } from "firebase-admin";
import { initializeApp, cert, getApps } from "firebase-admin/app";

type ServiceAccountKey = keyof Pick<
  ServiceAccount,
  "projectId" | "privateKey" | "clientEmail"
>;

const importMetaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })
  ?.env ?? {};

const getEnvVar = (name: string) => process.env[name] ?? importMetaEnv[name];

const serviceAccount = {
  type: "service_account",
  project_id: getEnvVar("FIREBASE_PROJECT_ID"),
  private_key_id: getEnvVar("FIREBASE_PRIVATE_KEY_ID"),
  private_key: getEnvVar("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  client_email: getEnvVar("FIREBASE_CLIENT_EMAIL"),
  client_id: getEnvVar("FIREBASE_CLIENT_ID"),
  auth_uri: getEnvVar("FIREBASE_AUTH_URI"),
  token_uri: getEnvVar("FIREBASE_TOKEN_URI"),
  auth_provider_x509_cert_url: getEnvVar("FIREBASE_AUTH_CERT_URL"),
  client_x509_cert_url: getEnvVar("FIREBASE_CLIENT_CERT_URL"),
};

const requiredServiceAccountFields: ServiceAccountKey[] = [
  "projectId",
  "privateKey",
  "clientEmail",
];

const missingServiceAccountFields = requiredServiceAccountFields.filter((key) => {
  const mappedKey = key
    .replace("projectId", "project_id")
    .replace("privateKey", "private_key")
    .replace("clientEmail", "client_email") as keyof typeof serviceAccount;

  const value = serviceAccount[mappedKey];
  return typeof value !== "string" || value.trim().length === 0;
});

export const hasValidFirebaseConfig = missingServiceAccountFields.length === 0;

let initializedApp: App | null = null;

const initializeFirebaseApp = () =>
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });

const missingFirebaseEnvVars = missingServiceAccountFields.map((field) => {
  switch (field) {
    case "projectId":
      return "FIREBASE_PROJECT_ID";
    case "privateKey":
      return "FIREBASE_PRIVATE_KEY";
    case "clientEmail":
      return "FIREBASE_CLIENT_EMAIL";
    default:
      return field;
  }
});

if (hasValidFirebaseConfig) {
  const activeApps = getApps();
  initializedApp = activeApps.length === 0 ? initializeFirebaseApp() : activeApps[0] ?? null;
} else {
  console.warn(
    "Firebase Admin SDK skipped initialization because required environment variables are missing:",
    missingFirebaseEnvVars
  );
}

export const app = initializedApp;
export { missingFirebaseEnvVars };
