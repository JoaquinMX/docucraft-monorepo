import type { APIContext } from "astro";
import { app } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import type { Auth, UserRecord } from "firebase-admin/auth";

const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

const AUTH_ERRORS = {
  missing: "Authentication required",
  invalid: "Invalid authentication",
} as const;

type Cookies = APIContext["cookies"];

export type SessionGuardResult =
  | { ok: true; user: UserRecord; isAnonymous: boolean }
  | { ok: false; response: Response };

function createAuthErrorResponse(status: number, message: string): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: JSON_HEADERS,
    }
  );
}

let authInstance: Auth | undefined;

export function getServerAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(app);
  }

  return authInstance;
}

export async function guardSession(cookies: Cookies): Promise<SessionGuardResult> {
  const sessionCookie = cookies.get("__session")?.value;

  if (!sessionCookie) {
    return {
      ok: false,
      response: createAuthErrorResponse(401, AUTH_ERRORS.missing),
    };
  }

  const auth = getServerAuth();

  try {
    const decodedCookie = await auth.verifySessionCookie(sessionCookie);
    const user = await auth.getUser(decodedCookie.uid);
    const isAnonymous = user.providerData.length === 0;

    return {
      ok: true,
      user,
      isAnonymous,
    };
  } catch (error) {
    console.warn("Failed to verify session cookie", error);

    return {
      ok: false,
      response: createAuthErrorResponse(401, AUTH_ERRORS.invalid),
    };
  }
}
