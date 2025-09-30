
'use client';

import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageUploaderProps {
  onUrlChange: (url: string) => void;
  initialUrl?: string;
}

const storage = getStorage(app);

export function ImageUploader({ onUrlChange, initialUrl }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(initialUrl || '');
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (initialUrl) {
      setImageUrl(initialUrl);
    }
  }, [initialUrl]);

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
  
  const handleUrlSubmit = () => {
    if (!urlInput) {
        toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid image URL.' });
        return;
    }
    try {
        new URL(urlInput);
        setImageUrl(urlInput);
        onUrlChange(urlInput);
        toast({ title: 'Image URL Set', description: 'The image will be loaded from the provided URL.' });
    } catch (_) {
        toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid image URL.' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 relative overflow-hidden">
        {uploading ? (
          <div className="w-full max-w-xs p-4 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
            <p className="mb-2 text-sm font-medium">Uploading...</p>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
          </div>
        ) : imageUrl ? (
          <Image src={imageUrl} alt="Uploaded feature image" fill className="object-cover" />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p>No image uploaded</p>
          </div>
        )}
      </div>

       <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload File
            </TabsTrigger>
            <TabsTrigger value="url">
                <LinkIcon className="mr-2 h-4 w-4" />
                From URL
            </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-4">
             <Input id="file-upload" type="file" onChange={handleFileChange} disabled={uploading} className="hidden" />
             <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading}>
                {imageUrl ? 'Change Image' : 'Select Image to Upload'}
            </Button>
        </TabsContent>
        <TabsContent value="url" className="mt-4">
            <div className="flex gap-2">
                <Input 
                    type="url" 
                    placeholder="https://example.com/image.png" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={uploading}
                />
                <Button type="button" onClick={handleUrlSubmit} disabled={uploading}>Set Image</Button>
            </div>
        </TabsContent>
       </Tabs>
    </div>
  );
}
