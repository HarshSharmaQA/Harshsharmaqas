
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    post: {
        title: string;
        seoDescription: string;
    }
}

export function ShareButton({ post }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: post?.title,
      text: post?.seoDescription,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'The link to this post has been copied to your clipboard.',
      });
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
