// Available project images
export const PROJECT_IMAGES = {
  alpha: {
    id: "alpha",
    name: "Alpha",
    src: "/src/assets/alpha.png",
    alt: "Alpha project image",
  },
  beta: {
    id: "beta",
    name: "Beta",
    src: "/src/assets/beta.png",
    alt: "Beta project image",
  },
  gamma: {
    id: "gamma",
    name: "Gamma",
    src: "/src/assets/gamma.png",
    alt: "Gamma project image",
  },
  delta: {
    id: "delta",
    name: "Delta",
    src: "/src/assets/delta.png",
    alt: "Delta project image",
  },
  zeta: {
    id: "zeta",
    name: "Zeta",
    src: "/src/assets/zeta.png",
    alt: "Zeta project image",
  },
} as const;

export type ProjectImageId = keyof typeof PROJECT_IMAGES;
