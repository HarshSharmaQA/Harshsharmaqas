'use server';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('You must be logged in to perform this action.');
    }
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        throw new Error('You do not have permission to perform this action.');
    }
}

export async function updateUserRole(uid: string, role: 'admin' | 'user') {
  try {
    await verifyAdmin();
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });

    revalidatePath('/admin/users'); // This will trigger a data refetch on the users page.
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
