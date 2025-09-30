'use client';

import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  onUrlChange: (url: string) => void;
  initialUrl?: string;
}

const storage = getStorage(app);

export function ImageUploader({ onUrlChange, initialUrl }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl || null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select an image file.',
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setImageUrl(null);

    const storageRef = ref(storage, `blog-images/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        setUploading(false);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message,
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          onUrlChange(downloadURL);
          setUploading(false);
          toast({
            title: 'Upload Complete',
            description: 'Your image has been uploaded successfully.',
          });
        });
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden">
        {imageUrl && !uploading && (
          <Image src={imageUrl} alt="Uploaded feature image" fill className="object-cover" />
        )}
        {!imageUrl && !uploading && (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p>No image uploaded</p>
          </div>
        )}
        {uploading && (
          <div className="w-full max-w-xs p-4 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
            <p className="mb-2">Uploading...</p>
            <Progress value={progress} />
          </div>
        )}
      </div>
      <Input id="file-upload" type="file" onChange={handleFileChange} disabled={uploading} className="hidden" />
      <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading}>
        {imageUrl ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  );
}
