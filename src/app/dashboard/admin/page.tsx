"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { approveEvent, rejectEvent } from "@/lib/db";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function AdminDashboard() {
  const { user, loading, getUserRole } = useAuth("/auth/login");
  const [events, setEvents] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      getUserRole().then((role) => {
        if (role !== "admin") {
          toast.error("Access denied. Redirecting...");
          router.push("/dashboard/student");
        }
      });
      const unsubscribeEvents = onSnapshot(
        collection(db, "events"),
        (snapshot) => {
          const pendingEvents = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((event) => event.status === "pending");
          setEvents(pendingEvents);
        }
      );
      const unsubscribeApproved = onSnapshot(
        query(collection(db, "events"), where("status", "==", "approved")),
        (snapshot) => {
          setApprovedEvents(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }
      );
      const unsubscribeFeedback = onSnapshot(
        collection(db, "feedback"),
        (snapshot) => {
          setFeedback(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }
      );
      return () => {
        unsubscribeEvents();
        unsubscribeApproved();
        unsubscribeFeedback();
      };
    }
  }, [user, loading, getUserRole]);

  const handleApprove = async (eventId: string) => {
    if (!user) return;
    try {
      await approveEvent(eventId, user.uid);
      toast.success("Event approved successfully!");
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (error) {
      toast.error("Failed to approve event.");
    }
  };

  const handleReject = async (eventId: string) => {
    if (!user || !rejectReason) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      await rejectEvent(eventId, user.uid, rejectReason);
      toast.success("Event rejected successfully!");
      setEvents(events.filter((e) => e.id !== eventId));
      setRejectReason("");
    } catch (error) {
      toast.error("Failed to reject event.");
    }
  };

  const handleTriggerNotification = async (eventId: string) => {
    if (!user) return;
    setNotificationLoading(eventId);
    try {
      const response = await fetch("/api/triggerNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, adminId: user.uid }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Notifications sent to all participants!");
      } else {
        toast.error(data.error || "Failed to trigger notifications");
      }
    } catch (error) {
      toast.error("Failed to trigger notifications");
    } finally {
      setNotificationLoading(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Organizer Phone</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.eventTitle}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    {event.date instanceof Date
                      ? event.date.toLocaleDateString()
                      : new Date(
                          event.date?.seconds * 1000
                        ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.organizerPhone}</TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button
                        onClick={() => handleApprove(event.id)}
                        className="bg-green-500 text-white hover:bg-green-600"
                        disabled={event.status === "approved"}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(event.id)}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        Reject
                      </Button>
                      <Input
                        placeholder="Rejection reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="mt-2 w-full"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Approved Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Organizer Phone</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.eventTitle}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    {event.date instanceof Date
                      ? event.date.toLocaleDateString()
                      : new Date(
                          event.date?.seconds * 1000
                        ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.organizerPhone}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleTriggerNotification(event.id)}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      disabled={notificationLoading === event.id}
                    >
                      {notificationLoading === event.id
                        ? "Sending..."
                        : "Trigger Notification"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feedback</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.text}</TableCell>
                  <TableCell>{item.submittedBy}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
}
