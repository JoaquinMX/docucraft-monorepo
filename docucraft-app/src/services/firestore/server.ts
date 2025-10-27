import { getFirestore } from "firebase-admin/firestore";
import { app } from "@/firebase/server";
import { FIRESTORE_COLLECTIONS } from "@/constants/firestore";
import { DEFAULT_PROJECT_IMAGE_ID, type ProjectImageId } from "@/constants/images";
import type { Project } from "@/types/Project";
import type { AIAnalysis } from "@/types/AIAnalysis";
import { normalizeProjectRecord, sanitizeProjectImageInput } from "@/utils/project";
import type { FirestoreAdapter, FirestoreProjectInput } from "./index";

const db = getFirestore(app);

const projectCollection = (userId: string) =>
  db
    .collection(FIRESTORE_COLLECTIONS.USER_PROJECTS)
    .doc(userId)
    .collection(FIRESTORE_COLLECTIONS.PROJECTS);

const projectDoc = (userId: string, projectId: string) =>
  projectCollection(userId).doc(projectId);

export const firestoreServerAdapter: FirestoreAdapter = {
  async createProject(
    userId: string,
    projectData: FirestoreProjectInput,
    imageId: ProjectImageId = DEFAULT_PROJECT_IMAGE_ID
  ) {
    try {
      const projectWithTimestamps = {
        ...projectData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: sanitizeProjectImageInput(imageId),
      } satisfies Omit<Project, "id">;

      const docRef = await projectCollection(userId).add(projectWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }
  },

  async getProject(userId, projectId) {
    try {
      const docSnap = await projectDoc(userId, projectId).get();

      if (docSnap.exists) {
        const data = docSnap.data();

        if (data) {
          return normalizeProjectRecord(docSnap.id, data, userId);
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting project:", error);
      throw new Error("Failed to get project");
    }
  },

  async getAllProjects(userId) {
    try {
      const querySnapshot = await projectCollection(userId)
        .orderBy("createdAt", "desc")
        .get();

      return querySnapshot.docs.map((docSnapshot) =>
        normalizeProjectRecord(docSnapshot.id, docSnapshot.data(), userId)
      );
    } catch (error) {
      console.error("Error getting projects:", error);
      throw new Error("Failed to get projects");
    }
  },

  async updateProject(userId, projectId, updates) {
    try {
      const docRef = projectDoc(userId, projectId);
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
  },

  async updateAIAnalysis(userId, projectId, aiAnalysis) {
    try {
      const docRef = projectDoc(userId, projectId);
      await docRef.update({
        aiAnalysis,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating AI analysis:", error);
      throw new Error("Failed to update AI analysis");
    }
  },

  async updatePartialAIAnalysis(userId, projectId, partialAIAnalysis) {
    try {
      const docRef = projectDoc(userId, projectId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new Error("Project not found");
      }

      const currentData = docSnap.data();
      const currentAIAnalysis = (currentData?.aiAnalysis as AIAnalysis) || {};
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
  },

  async deleteProject(userId, projectId) {
    try {
      await projectDoc(userId, projectId).delete();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  },
};
