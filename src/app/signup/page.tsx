'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, User, getAdditionalUserInfo } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { app, db } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const createUserDocument = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // Only create a new document if one doesn't already exist.
    if (!userDoc.exists()) {
      let role = 'user';
      
      // Ensure the primary email is always an admin
      if (user.email === 'harshsharmaqa@gmail.com') {
        role = 'admin';
      } else {
        // Fallback for first-ever user if not the primary admin
        const usersCollectionRef = collection(db, 'users');
        const firstUserQuery = query(usersCollectionRef, limit(1));
        const snapshot = await getDocs(firstUserQuery);
        // If there are no users (this new user is the first), make them an admin.
        if (snapshot.empty) {
          role = 'admin';
        }
      }

      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: role,
        joinedAt: serverTimestamp(),
      });
    }
  };

  const handleLoginSuccess = async (user: User) => {
    // We create the user document here to handle both email and Google sign-up flows.
    await createUserDocument(user);
    
    toast({
      title: 'Success',
      description: 'Logged in successfully!',
    });

    // We must re-fetch the document to get the correct role, especially for the first user.
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleLoginSuccess(result.user);
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, {
        displayName: data.name
      });
      // Now handle the login success which includes creating the user document.
      await handleLoginSuccess(userCredential.user);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
       <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-lg font-semibold font-headline md:top-8 md:left-8 text-foreground">
        <Bot className="h-6 w-6 text-primary" />
        <span>QAWala</span>
      </Link>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Start your journey with QAWala today.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating Account...' : 'Create Account with Email'}
            </Button>
          </form>
           <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                OR
                </span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
             <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2L359.3 127.1c-24.3-23.8-58.2-38.2-97.3-38.2-74.6 0-135.3 60.7-135.3 135.3s60.7 135.3 135.3 135.3c82.3 0 119.4-49.3 123.4-74.6H248v-90.2h239.2c1.2 12.8 1.8 26.9 1.8 42.8z"></path></svg>
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
