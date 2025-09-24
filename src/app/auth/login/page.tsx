"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { getUserRole } = useAuth();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const role = await getUserRole();
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "student") {
        router.push("/dashboard/student");
      } else {
        toast.error(
          "User profile not found. Please register or contact support."
        );
      }
      if (role) toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4 p-4 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full"
        />
      </div>
      <Button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
      >
        Login
      </Button>
      <ToastContainer />
    </div>
  );
}
