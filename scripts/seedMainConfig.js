// scripts/seedMainConfig.js
import admin from "firebase-admin";
import fs from "fs";

// Load service account
const serviceAccount = JSON.parse(
  fs.readFileSync("./scripts/firebaseServiceAccount.json", "utf8")
);

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  const mainConfig = {
    openingMessage: "Welcome to IBA CEE Open Enrollment Program",
    closingMessage: "Thank you for your interest. We will contact you soon.",

    sections: {
      enrollmentNature: {
        question:
          "Please indicate if you are a self-sponsored participant or if your participation is sponsored by an organization.",
        options: ["Self", "Organization Sponsored"],
      },

      programs: {
        list: [
          "Data Analytics",
          "Artificial Intelligence",
          "Project Management",
        ],
      },

      organizationInfo: {
        questions: [
          // Example of other questions if needed:
          // { question: "Organization Name", type: "text" },
          
          // Immutable last question
          {
            id: "fixed-nomination-count",
            label: "How many Participants are you nominating?",
            type: "number",
            required: true,
            options: [],
            immutable: true // custom flag to indicate this cannot be changed
          },
        ],
      },

      userInfo: {
        questions: [],
      },

      generalInfo: {
        questions: [],
      },
    },
  };

  await db.collection("formConfig").doc("mainConfig").set(mainConfig);
  console.log("✅ mainConfig seeded successfully");
}

seed().catch(console.error);
