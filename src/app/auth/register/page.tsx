"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    phoneNumber: "",
    role: "student",
  });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(userCredential.user, {
        displayName: formData.displayName,
      });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: formData.email,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });
      toast.success("Registration successful! Redirecting...");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          placeholder="Full Name"
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
        />
        <Input
          placeholder="Phone Number (e.g., +1234567890)"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
        <Input
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <Button
          type="submit"
          className="w-full bg-blue-500 text-white hover:bg-blue-600"
        >
          Register
        </Button>
      </form>
      <ToastContainer />
    </div>
  );
}
