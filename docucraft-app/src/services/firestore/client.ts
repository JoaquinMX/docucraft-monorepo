import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { app } from "@/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/constants/firestore";
import { DEFAULT_PROJECT_IMAGE_ID, type ProjectImageId } from "@/constants/images";
import type { Project } from "@/types/Project";
import type { AIAnalysis } from "@/types/AIAnalysis";
import { normalizeProjectRecord, sanitizeProjectImageInput } from "@/utils/project";
import type { FirestoreAdapter, FirestoreProjectInput } from "./index";

const db = getFirestore(app);

const projectCollection = (userId: string) =>
  collection(
    db,
    FIRESTORE_COLLECTIONS.USER_PROJECTS,
    userId,
    FIRESTORE_COLLECTIONS.PROJECTS
  );

const projectDoc = (userId: string, projectId: string) =>
  doc(
    db,
    FIRESTORE_COLLECTIONS.USER_PROJECTS,
    userId,
    FIRESTORE_COLLECTIONS.PROJECTS,
    projectId
  );

export const firestoreClientAdapter: FirestoreAdapter = {
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

      const docRef = await addDoc(projectCollection(userId), projectWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }
  },

  async getProject(userId, projectId) {
    try {
      const docSnap = await getDoc(projectDoc(userId, projectId));

      if (docSnap.exists()) {
        return normalizeProjectRecord(docSnap.id, docSnap.data(), userId);
      }

      return null;
    } catch (error) {
      console.error("Error getting project:", error);
      throw new Error("Failed to get project");
    }
  },

  async getAllProjects(userId) {
    try {
      const q = query(projectCollection(userId), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

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

      await updateDoc(docRef, {
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
      await updateDoc(docRef, {
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
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Project not found");
      }

      const currentData = docSnap.data();
      const currentAIAnalysis = (currentData?.aiAnalysis as AIAnalysis) || {};
      const updatedAIAnalysis: AIAnalysis = {
        ...currentAIAnalysis,
        ...partialAIAnalysis,
      };

      await updateDoc(docRef, {
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
      await deleteDoc(projectDoc(userId, projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  },
};
