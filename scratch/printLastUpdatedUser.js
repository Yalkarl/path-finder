const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLastUser() {
  try {
    const q = query(collection(db, "users"), orderBy("updatedAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No users found.");
      return;
    }
    querySnapshot.forEach((doc) => {
      const p = doc.data();
      console.log(`\n=== LAST UPDATED USER: ${doc.id} (${p.name || 'No Name'}) ===`);
      console.log("UpdatedAt:", p.updatedAt);
      console.log("CompletedSetup:", p.completedSetup);
      console.log("Education Level:", p.educationLevel);
      console.log("Analysis Mode:", p.analysisMode);
      console.log("Target Path:", p.targetPath);
      console.log("Self Assessment:", p.selfAssessment);
      console.log("Academics:", p.academics);
      console.log("Used Questions:", p.usedQuestionIds);
      console.log("Responses length:", p.assessment?.responses?.length || 0);
      console.log("Responses:", JSON.stringify(p.assessment?.responses));
      console.log("Portfolio:", p.portfolio);
      console.log("Custom Activities:", p.customActivities);
      console.log("Results Skill Vector:", p.results?.skillVector);
    });
  } catch (err) {
    console.error("Error fetching last user:", err);
  }
}

checkLastUser();
