
'use client';

import { useState, useEffect } from 'react';
import { db, app } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: string;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  useEffect(() => {
    const postRef = doc(db, 'blogs', postId);
    const likesRef = collection(postRef, 'likes');

    // Listen for changes to the like count
    const unsubscribeLikes = onSnapshot(collection(db, 'blogs', postId, 'likes'), snapshot => {
      setLikes(snapshot.size);
      if (user) {
        // Check if the current user has already liked this post
        const liked = snapshot.docs.some(doc => doc.id === user.uid);
        setIsLiked(liked);
      }
      setLoading(false);
    });

    return () => unsubscribeLikes();
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to like a post.',
      });
      return;
    }
    
    setLoading(true);
    const postRef = doc(db, 'blogs', postId);
    const likeRef = doc(postRef, 'likes', user.uid);
    const likeDoc = await getDoc(likeRef);
    
    const batch = writeBatch(db);

    if (likeDoc.exists()) {
      // User has already liked, so unlike
      batch.delete(likeRef);
      setIsLiked(false);
    } else {
      // User has not liked, so like
      batch.set(likeRef, { createdAt: serverTimestamp() });
      setIsLiked(true);
    }

    try {
      await batch.commit();
    } catch (error) {
       console.error("Error updating like: ", error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem processing your request.',
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
      )}
      <span>{likes}</span>
    </Button>
  );
}
