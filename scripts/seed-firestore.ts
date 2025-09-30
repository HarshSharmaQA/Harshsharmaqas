import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing config values
for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value) {
        console.error(`Error: Missing Firebase config value for ${key}`);
        console.error('Please make sure your .env.local file is correctly set up.');
        process.exit(1);
    }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import your mock data
import { courses } from '../src/lib/mock-data';

async function seedDatabase() {
  const coursesCollection = collection(db, 'courses');

  console.log('Checking for existing documents in the courses collection...');
  const existingDocs = await getDocs(coursesCollection);
  if (!existingDocs.empty) {
    console.log(`Found ${existingDocs.size} existing documents. Deleting them...`);
    const deleteBatch = writeBatch(db);
    existingDocs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log('Existing documents deleted.');
  } else {
    console.log('No existing documents found.');
  }

  // Create a new batch
  const batch = writeBatch(db);

  // Add each course to the batch
  courses.forEach((course) => {
    // Firestore will auto-generate an ID if you don't specify one
    const docRef = collection(db, 'courses').doc(course.slug);
    batch.set(docRef, course);
  });

  try {
    // Commit the batch
    await batch.commit();
    console.log(`Successfully seeded ${courses.length} courses.`);
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
}

seedDatabase().then(() => {
  console.log('Seeding process finished.');
  // Firestore doesn't require a manual disconnect, but we exit the process
  process.exit(0);
});
