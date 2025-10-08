import { getFirestore } from "firebase-admin/firestore";
import { app } from "@/firebase/server";
import { FIRESTORE_COLLECTIONS } from "@/constants/firestore";
import type { Project } from "@/types/Project";
import type { AIAnalysis } from "@/types/AIAnalysis";
import {
  DEFAULT_PROJECT_IMAGE_ID,
  type ProjectImageId,
} from "@/constants/images";
import {
  normalizeProjectRecord,
  sanitizeProjectImageInput,
} from "@/utils/project";
import type { UserBillingProfile } from "@/types/Billing";
import { InsufficientCreditsError } from "@/types/Billing";

const db = getFirestore(app);

export class FirestoreServerService {
  private static createDefaultBillingProfile(): UserBillingProfile {
    const now = new Date().toISOString();
    return {
      planId: "free",
      creditsRemaining: 0,
      subscriptionActive: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create a new project with AI analysis
   */
  static async createProject(
    userId: string,
    projectData: Omit<
      Project,
      "id" | "userId" | "image" | "createdAt" | "updatedAt"
    >,
    imageId: ProjectImageId = DEFAULT_PROJECT_IMAGE_ID
  ): Promise<string> {
    try {
      const projectWithTimestamps = {
        ...projectData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: sanitizeProjectImageInput(imageId),
      };

      const docRef = await db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .add(projectWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }
  }

  /**
   * Get a project by ID for a specific user
   */
  static async getProject(
    userId: string,
    projectId: string
  ): Promise<Project | null> {
    try {
      const docRef = db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .doc(projectId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        if (data) {
          return normalizeProjectRecord(docSnap.id, data, userId);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting project:", error);
      throw new Error("Failed to get project");
    }
  }

  /**
   * Get all projects for a specific user ordered by creation date
   */
  static async getAllProjects(userId: string): Promise<Project[]> {
    try {
      const q = db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .orderBy("createdAt", "desc");
      const querySnapshot = await q.get();

      return querySnapshot.docs.map((doc) =>
        normalizeProjectRecord(doc.id, doc.data(), userId)
      );
    } catch (error) {
      console.error("Error getting projects:", error);
      throw new Error("Failed to get projects");
    }
  }

  /**
   * Update a project for a specific user
   */
  static async updateProject(
    userId: string,
    projectId: string,
    updates: Partial<Project>
  ): Promise<void> {
    try {
      const docRef = db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .doc(projectId);
      const sanitizedUpdates: Partial<Project> = { ...updates };

      if (updates.image) {
        sanitizedUpdates.image = sanitizeProjectImageInput(updates.image);
      }

      await docRef.update({
        ...sanitizedUpdates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating project:", error);
      throw new Error("Failed to update project");
    }
  }

  /**
   * Update AI analysis for a project (replaces entire analysis)
   */
  static async updateAIAnalysis(
    userId: string,
    projectId: string,
    aiAnalysis: AIAnalysis
  ): Promise<void> {
    try {
      const docRef = db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .doc(projectId);
      await docRef.update({
        aiAnalysis,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating AI analysis:", error);
      throw new Error("Failed to update AI analysis");
    }
  }

  /**
   * Update partial AI analysis for a project (merges with existing analysis)
   */
  static async updatePartialAIAnalysis(
    userId: string,
    projectId: string,
    partialAIAnalysis: Partial<AIAnalysis>
  ): Promise<void> {
    try {
      const docRef = db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .doc(projectId);

      // Get current project to merge with existing AI analysis
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error("Project not found");
      }

      const currentData = docSnap.data();
      const currentAIAnalysis = (currentData?.aiAnalysis as AIAnalysis) || {};

      // Merge partial updates with existing analysis
      const updatedAIAnalysis: AIAnalysis = {
        ...currentAIAnalysis,
        ...partialAIAnalysis,
      };

      await docRef.update({
        aiAnalysis: updatedAIAnalysis,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating partial AI analysis:", error);
      throw new Error("Failed to update partial AI analysis");
    }
  }

  /**
   * Delete a project for a specific user
   */
  static async deleteProject(userId: string, projectId: string): Promise<void> {
    try {
      const docRef = db
        .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
        .doc(userId)
        .collection(FIRESTORE_COLLECTIONS.PROJECTS)
        .doc(projectId);
      await docRef.delete();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  }

  /**
   * Retrieve the billing profile for a user, creating a default one if missing
   */
  static async getOrCreateUserBillingProfile(
    userId: string
  ): Promise<UserBillingProfile> {
    const docRef = db
      .collection(FIRESTORE_COLLECTIONS.USER_BILLING_PROFILES)
      .doc(userId);

    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data) {
        return data as UserBillingProfile;
      }
    }

    const defaultProfile = FirestoreServerService.createDefaultBillingProfile();
    await docRef.set(defaultProfile);
    return defaultProfile;
  }

  /**
   * Increment the user's credits (or activate subscription) when a plan is purchased
   */
  static async applyPlanToUser(
    userId: string,
    planId: string,
    creditsToAdd: number,
    subscriptionActive: boolean,
    paymentIntentId?: string
  ): Promise<UserBillingProfile> {
    const docRef = db
      .collection(FIRESTORE_COLLECTIONS.USER_BILLING_PROFILES)
      .doc(userId);

    return await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
      const now = new Date().toISOString();
      const baseProfile = docSnap.exists
        ? ((docSnap.data() as UserBillingProfile) ??
            FirestoreServerService.createDefaultBillingProfile())
        : FirestoreServerService.createDefaultBillingProfile();

      const updatedProfile: UserBillingProfile = {
        ...baseProfile,
        planId,
        subscriptionActive,
        updatedAt: now,
        ...(docSnap.exists ? {} : { createdAt: now }),
      };

      if (subscriptionActive) {
        updatedProfile.subscriptionActive = true;
      } else {
        updatedProfile.subscriptionActive = false;
        updatedProfile.creditsRemaining = Math.max(
          0,
          (baseProfile.creditsRemaining ?? 0) + creditsToAdd
        );
      }

      if (paymentIntentId) {
        updatedProfile.lastPaymentIntentId = paymentIntentId;
      } else if (baseProfile.lastPaymentIntentId) {
        updatedProfile.lastPaymentIntentId = baseProfile.lastPaymentIntentId;
      }

      transaction.set(docRef, updatedProfile, { merge: true });
      return updatedProfile;
    });
  }

  /**
   * Deduct credits for AI generation. Throws InsufficientCreditsError if unavailable.
   */
  static async consumeCredits(
    userId: string,
    amount: number
  ): Promise<UserBillingProfile> {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const docRef = db
      .collection(FIRESTORE_COLLECTIONS.USER_BILLING_PROFILES)
      .doc(userId);

    return await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists) {
        throw new InsufficientCreditsError();
      }

      const profile = docSnap.data() as UserBillingProfile;
      const now = new Date().toISOString();

      if (profile.subscriptionActive) {
        const updatedProfile: UserBillingProfile = {
          ...profile,
          updatedAt: now,
        };
        transaction.set(docRef, updatedProfile, { merge: true });
        return updatedProfile;
      }

      if ((profile.creditsRemaining ?? 0) < amount) {
        throw new InsufficientCreditsError();
      }

      const updatedProfile: UserBillingProfile = {
        ...profile,
        creditsRemaining: profile.creditsRemaining - amount,
        updatedAt: now,
      };

      transaction.set(docRef, updatedProfile, { merge: true });
      return updatedProfile;
    });
  }
}
