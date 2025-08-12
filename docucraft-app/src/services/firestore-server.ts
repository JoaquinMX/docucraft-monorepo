import { getFirestore } from "firebase-admin/firestore";
import { app } from "@/firebase/server";
import { FIRESTORE_COLLECTIONS } from "@/constants/firestore";
import type { Project } from "@/types/Project";
import type { AIAnalysis } from "@/types/AIAnalysis";

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
    imageOrId?: string
  ): Promise<string> {
    try {
      const projectWithTimestamps = {
        ...projectData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store image as an id when provided; fallback to legacy default URL for backward compatibility
        image:
          imageOrId ||
          `https://lh3.googleusercontent.com/aida-public/AB6AXuBRfMiK-Xsf_XJBQ3H4OOzgt7XeJ2nlf0u5HP2OMdgTEFA6OqignBoIALpu7JH9qaD1CPWYihZ0v-LxhByazArNbkFSjDX64RrLUNm5bR87uvW4-mwwkEkWQJsYy1NgRURSibn5ZrYE2-dDsbn-opjBbXi52q6b--SQUoaDvlRLtnkcrQxFNFrXaDSFXGwOrl88zQ9madUbeeV5oStfpycOFShMuBaw93px9MaeHTBscgMuEuKVyYGrECq4nbvAqkegfbiphNC3Q`,
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
        return { id: docSnap.id, ...docSnap.data() } as Project;
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

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
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
      await docRef.update({
        ...updates,
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
