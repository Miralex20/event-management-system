import { auth } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto mt-10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Campus Event Notifier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-center ">
            Welcome to the Campus Event Notification System!
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              className="bg-blue-500 text-white hover:bg-blue-600 px-10 py-5 rounded-md"
            >
              <Link href="/auth/register">Register</Link>
            </Button>
            <Button asChild variant="outline" className="px-10 py-5 rounded-md">
              <Link href="./auth/login">Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
