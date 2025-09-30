
'use client';

import { useState, useEffect } from 'react';
import { db, app } from '@/lib/firebase';
import { collection, doc, getDoc, serverTimestamp, deleteDoc, getCountFromServer, setDoc } from 'firebase/firestore';
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
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(app);
  const [user, authLoading] = useAuthState(auth);
  const { toast } = useToast();

  useEffect(() => {
    const getLikes = async () => {
      setIsLoading(true);
      try {
        const likesCol = collection(db, 'blogs', postId, 'likes');
        const snapshot = await getCountFromServer(likesCol);
        setLikes(snapshot.data().count);

        if (user) {
          const likeDocRef = doc(db, 'blogs', postId, 'likes', user.uid);
          const likeDoc = await getDoc(likeDocRef);
          setIsLiked(likeDoc.exists());
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      getLikes();
    }
  }, [postId, user, authLoading]);

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to like a post.',
      });
      return;
    }
    
    const likeRef = doc(db, 'blogs', postId, 'likes', user.uid);
    const wasLiked = isLiked;

    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLikes(prev => wasLiked ? prev - 1 : prev + 1);
    setIsLoading(true);

    try {
        if (wasLiked) {
            await deleteDoc(likeRef);
        } else {
            await setDoc(likeRef, { createdAt: serverTimestamp() });
        }
    } catch (error) {
       console.error("Error updating like: ", error);
       // Revert optimistic update on error
       setIsLiked(wasLiked);
       setLikes(prev => wasLiked ? prev + 1 : prev - 1);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem processing your request.',
      });
    } finally {
        // Fetch true count from server to ensure consistency
        const likesCol = collection(db, 'blogs', postId, 'likes');
        const snapshot = await getCountFromServer(likesCol);
        setLikes(snapshot.data().count);
        setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLike}
      disabled={isLoading || authLoading}
      className="flex items-center gap-2"
    >
      {(isLoading || authLoading) ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
      )}
      <span>{likes}</span>
    </Button>
  );
}
