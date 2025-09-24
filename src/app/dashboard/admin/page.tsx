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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import {
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { approveEvent, rejectEvent, scheduleNotification } from "@/lib/db";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function AdminDashboard() {
  const { user, loading, getUserRole } = useAuth("/auth/login");
  const [events, setEvents] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    eventId: "",
    scheduledTime: "",
    target: "targeted",
  });
  const [date, setDate] = useState<Date>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      getUserRole().then((role) => {
        if (role !== "admin") {
          toast.error("Access denied. Redirecting...");
          router.push("/auth/login");
        }
      });
      // Pending events
      const unsubscribeEvents = onSnapshot(
        collection(db, "events"),
        (snapshot) => {
          const pendingEvents = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((event) => event.status === "pending");
          setEvents(pendingEvents);
        }
      );
      // Approved events for scheduling
      const unsubscribeApproved = onSnapshot(
        query(collection(db, "events"), where("status", "==", "approved")),
        (snapshot) => {
          setApprovedEvents(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }
      );
      // Feedback
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

  const handleScheduleNotification = async () => {
    if (!scheduleForm.eventId || !scheduleForm.scheduledTime) {
      toast.error("Please select an event and scheduled time.");
      return;
    }
    try {
      const scheduledTime = `${date.toISOString().split("T")[0]}T${
        scheduleForm.scheduledTime
      }:00Z`;
      await scheduleNotification(
        scheduleForm.eventId,
        scheduledTime,
        scheduleForm.target as "bulk" | "targeted"
      );
      toast.success("Notification scheduled successfully!");
      setScheduleForm({ eventId: "", scheduledTime: "", target: "targeted" });
      setDate(new Date());
    } catch (error) {
      toast.error("Failed to schedule notification.");
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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.eventTitle}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    {new Date(event.date.seconds * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button
                        onClick={() => handleApprove(event.id)}
                        className="bg-green-500 text-white hover:bg-green-600"
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
          <CardTitle>Schedule Notification for Approved Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={scheduleForm.eventId}
              onValueChange={(value) =>
                setScheduleForm({ ...scheduleForm, eventId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select approved event" />
              </SelectTrigger>
              <SelectContent>
                {approvedEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.eventTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <Input
              type="time"
              value={scheduleForm.scheduledTime}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  scheduledTime: e.target.value,
                })
              }
              placeholder="Select time"
            />
            <Select
              value={scheduleForm.target}
              onValueChange={(value) =>
                setScheduleForm({ ...scheduleForm, target: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="targeted">
                  Targeted (Accepted Participants)
                </SelectItem>
                <SelectItem value="bulk">Bulk (All Students)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleScheduleNotification}
              className="w-full bg-purple-500 text-white hover:bg-purple-600"
            >
              Schedule Notification
            </Button>
          </div>
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
                <TableHead>Phone Number</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.text}</TableCell>
                  <TableCell>{item.submittedBy}</TableCell>
                  <TableCell>{item.phoneNumber}</TableCell>
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
