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
