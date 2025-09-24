import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useAuth(redirectTo: string = "/auth/login") {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const getUserRole = async () => {
    if (!user) return null;

    try {
      // Check if user is an admin (exists in "admins" collection)
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        return "admin";
      }

      // Check if user is a student (exists in "users" collection)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        return "student";
      }

      // User not registered in either collection
      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  return { user, loading, getUserRole };
}
