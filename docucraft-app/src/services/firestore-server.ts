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

const db = getFirestore(app);

export class FirestoreServerService {
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
        return normalizeProjectRecord(docSnap.id, docSnap.data(), userId);
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
   * Update AI analysis for a project
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
}
