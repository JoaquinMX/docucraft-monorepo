module.exports = {
  overrides: [
    {
      files: ["src/services/firestore/index.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "firebase/firestore",
                message:
                  "Use the runtime-specific Firestore adapters instead of importing the client SDK in the shared interface.",
              },
              {
                name: "firebase-admin/firestore",
                message:
                  "Use the runtime-specific Firestore adapters instead of importing the admin SDK in the shared interface.",
              },
            ],
          },
        ],
      },
    },
  ],
};
