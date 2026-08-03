const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

console.log("Config Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    console.log(`Found ${querySnapshot.size} users:`);
    querySnapshot.forEach((doc) => {
      const p = doc.data();
      console.log(`\n--- User ${doc.id} (${p.name || 'No Name'}) ---`);
      console.log("Education Level:", p.educationLevel);
      console.log("Analysis Mode:", p.analysisMode);
      console.log("Target Path:", p.targetPath);
      console.log("Self Assessment:", p.selfAssessment);
      console.log("Academics:", p.academics);
      console.log("Used Questions Length:", p.usedQuestionIds?.length || 0);
      console.log("Responses Length:", p.assessment?.responses?.length || 0);
      console.log("Results Skill Vector:", p.results?.skillVector);
      if (p.results?.matchRankings) {
        console.log("Top 3 matchRankings:");
        p.results.matchRankings.slice(0, 3).forEach((r, idx) => {
          console.log(`  ${idx + 1}. ${r.name} (${r.matchPercentage}%)`);
        });
      }
    });
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

checkUsers();
