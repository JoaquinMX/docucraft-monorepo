import alphaImage from "@/assets/alpha.png";
import betaImage from "@/assets/beta.png";
import gammaImage from "@/assets/gamma.png";
import deltaImage from "@/assets/delta.png";
import zetaImage from "@/assets/zeta.png";

// Available project images

// Define the images map and derive types from it
export const PROJECT_IMAGES = {
  alpha: {
    id: "alpha",
    name: "Alpha",
    src: alphaImage,
    alt: "Alpha project image",
  },
  beta: {
    id: "beta",
    name: "Beta",
    src: betaImage,
    alt: "Beta project image",
  },
  gamma: {
    id: "gamma",
    name: "Gamma",
    src: gammaImage,
    alt: "Gamma project image",
  },
  delta: {
    id: "delta",
    name: "Delta",
    src: deltaImage,
    alt: "Delta project image",
  },
  zeta: {
    id: "zeta",
    name: "Zeta",
    src: zetaImage,
    alt: "Zeta project image",
  },
} as const;

export type ProjectImageId = keyof typeof PROJECT_IMAGES;
export type ProjectImage = (typeof PROJECT_IMAGES)[ProjectImageId];

export const DEFAULT_PROJECT_IMAGE_ID: ProjectImageId = "alpha";

// Legacy public URL that was previously stored directly in Firestore
export const LEGACY_DEFAULT_PROJECT_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBRfMiK-Xsf_XJBQ3H4OOzgt7XeJ2nlf0u5HP2OMdgTEFA6OqignBoIALpu7JH9qaD1CPWYihZ0v-LxhByazArNbkFSjDX64RrLUNm5bR87uvW4-mwwkEkWQJsYy1NgRURSibn5ZrYE2-dDsbn-opjBbXi52q6b--SQUoaDvlRLtnkcrQxFNFrVXaDSFXGwOrl88zQ9madUbeeV5oStfpycOFShMuBaw93px9MaeHTBscgMuEuKVyYGrECq4nbvAqkegfbiphNC3Q";
