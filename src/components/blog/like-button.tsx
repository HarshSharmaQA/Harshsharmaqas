
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
    // Fetch the initial like count, which is public.
    const getLikeCount = async () => {
      try {
        const likesCol = collection(db, 'blogs', postId, 'likes');
        const snapshot = await getCountFromServer(likesCol);
        setLikes(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching like count:", error);
      } finally {
        // We set loading to false here regardless of user auth status
        // because the public count has been fetched.
        if (!user) {
          setIsLoading(false);
        }
      }
    };

    getLikeCount();
  }, [postId]);

  useEffect(() => {
    // This effect runs when the user's authentication state is known.
    if (authLoading) {
      // Still checking for user, keep loading.
      setIsLoading(true);
      return;
    }

    if (user) {
      // User is logged in, now check their like status.
      const checkUserLike = async () => {
        setIsLoading(true);
        const likeDocRef = doc(db, 'blogs', postId, 'likes', user.uid);
        try {
          const likeDoc = await getDoc(likeDocRef);
          setIsLiked(likeDoc.exists());
        } catch (error) {
          console.error("Error checking user's like:", error);
        } finally {
          setIsLoading(false);
        }
      };
      checkUserLike();
    } else {
      // User is not logged in, ensure like status is false and stop loading.
      setIsLiked(false);
      setIsLoading(false);
    }
  }, [user, authLoading, postId]);

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to like a post.',
      });
      return;
    }
    
    setIsLoading(true);
    const likeRef = doc(db, 'blogs', postId, 'likes', user.uid);
    const wasLiked = isLiked;

    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLikes(prev => wasLiked ? prev - 1 : prev + 1);

    try {
        if (wasLiked) {
            await deleteDoc(likeRef);
        } else {
            await setDoc(likeRef, { createdAt: serverTimestamp(), userId: user.uid });
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
        // Fetch true count from server to ensure consistency, then stop loading.
        try {
            const likesCol = collection(db, 'blogs', postId, 'likes');
            const snapshot = await getCountFromServer(likesCol);
            setLikes(snapshot.data().count);
        } catch(e) {
            console.error("Could not refetch likes count after update", e);
        }
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
