/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-pages-firestore-admin",
      severity: "error",
      from: {
        path: "^src/pages/",
      },
      to: {
        path: "firebase-admin/firestore",
      },
    },
  ],
};
