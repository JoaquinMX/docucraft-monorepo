import {
  DEFAULT_PROJECT_IMAGE_ID,
  LEGACY_DEFAULT_PROJECT_IMAGE_URL,
  PROJECT_IMAGES,
  type ProjectImage,
  type ProjectImageId,
} from "@/constants/images";
import type { Project } from "@/types/Project";

const LEGACY_ASSET_PATH_REGEX = /\/src\/assets\/(.+)\.png$/i;

export function resolveProjectImageSrc(
  image: Project["image"]
): ProjectImage["src"] {
  if (typeof image === "string") {
    if (image in PROJECT_IMAGES) {
      return PROJECT_IMAGES[image as ProjectImageId].src;
    }

    const legacyMatch = image.match(LEGACY_ASSET_PATH_REGEX);
    if (legacyMatch) {
      const legacyId = legacyMatch[1] as ProjectImageId;
      if (legacyId in PROJECT_IMAGES) {
        return PROJECT_IMAGES[legacyId].src;
      }
    }
  }

  return PROJECT_IMAGES[DEFAULT_PROJECT_IMAGE_ID].src;
}

export function normalizeProjectImage(
  image: unknown
): ProjectImageId {
  if (typeof image === "string") {
    if (image in PROJECT_IMAGES) {
      return image as ProjectImageId;
    }

    if (image === LEGACY_DEFAULT_PROJECT_IMAGE_URL) {
      return DEFAULT_PROJECT_IMAGE_ID;
    }

    const legacyMatch = image.match(LEGACY_ASSET_PATH_REGEX);
    if (legacyMatch) {
      const id = legacyMatch[1] as ProjectImageId;
      if (id in PROJECT_IMAGES) {
        return id;
      }
    }
  }

  return DEFAULT_PROJECT_IMAGE_ID;
}

export function normalizeProjectRecord(
  id: string,
  data: Record<string, unknown>,
  fallbackUserId?: string
): Project {
  const image = normalizeProjectImage(data.image);

  return {
    id,
    userId: String(data.userId ?? fallbackUserId ?? ""),
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    keyObjectives: String(data.keyObjectives ?? ""),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
    image,
    aiAnalysis: data.aiAnalysis as Project["aiAnalysis"],
    selectedDiagrams: Array.isArray(data.selectedDiagrams)
      ? (data.selectedDiagrams as string[])
      : undefined,
  };
}

export function sanitizeProjectImageInput(
  image: unknown
): ProjectImageId {
  return normalizeProjectImage(image);
}
