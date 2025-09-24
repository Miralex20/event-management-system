import { auth } from "@/lib/firebase";

export default function Home() {
  console.log("Firebase Auth initialized:", auth);
  return (
    <div>
      Hello, Campus Notification System! Check console for Firebase auth.
    </div>
  );
}
