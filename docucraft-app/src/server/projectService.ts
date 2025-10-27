import { firestoreServerAdapter } from "@/services/firestore/server";
import type { Project } from "@/types/Project";

export type ProjectListDTO = {
  projects: Project[];
};

export type ProjectDetailDTO = {
  project: Project | null;
};

export async function getProjectsForUser(
  userId: string
): Promise<ProjectListDTO> {
  const projects = await firestoreServerAdapter.getAllProjects(userId);

  return { projects };
}

export async function getProjectForUser(
  userId: string,
  projectId: string
): Promise<ProjectDetailDTO> {
  const project = await firestoreServerAdapter.getProject(userId, projectId);

  return { project };
}
