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
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { onSnapshot, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { submitEvent, submitFeedback, acceptEvent } from "@/lib/db";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function StudentDashboard() {
  const { user, loading, getUserRole } = useAuth("/auth/login");
  const [events, setEvents] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({
    eventTitle: "",
    venue: "",
    date: "",
    time: "",
    organizerPhone: "",
  });
  const [feedbackText, setFeedbackText] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      getUserRole().then((role) => {
        if (role !== "student") {
          toast.error("Access denied. Redirecting...");
          router.push("/auth/login");
        }
      });
      const unsubscribe = onSnapshot(
        collection(db, "events"),
        (snapshot) => {
          const approvedEvents = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((event) => event.status === "approved");
          setEvents(approvedEvents);
        },
        (error) => console.error("Error fetching events:", error)
      );
      return () => unsubscribe();
    }
  }, [user, loading, getUserRole]);

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const dateTimeString = `${eventForm.date}T${eventForm.time}:00Z`;
    try {
      await submitEvent({
        eventTitle: eventForm.eventTitle,
        venue: eventForm.venue,
        dateTime: dateTimeString,
        organizerPhone: eventForm.organizerPhone,
      });
      toast.success("Event submitted successfully!");
      setEventForm({
        eventTitle: "",
        venue: "",
        date: "",
        time: "",
        organizerPhone: "",
      });
    } catch (error) {
      toast.error("Failed to submit event.");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user) return;
    try {
      await submitFeedback({ text: feedbackText, submittedBy: user.uid });
      toast.success("Feedback submitted successfully!");
      setFeedbackText("");
    } catch (error) {
      toast.error("Failed to submit feedback.");
    }
  };

  const handleAcceptEvent = async (eventId: string) => {
    if (!user) return;
    try {
      await acceptEvent(eventId, user.uid);
      toast.success("Event accepted successfully!");
      setEvents(
        events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                acceptedParticipants: [
                  ...(event.acceptedParticipants || []),
                  user.uid,
                ],
              }
            : event
        )
      );
    } catch (error) {
      toast.error("Failed to accept event.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={new Date()}
            className="rounded-md border"
          />
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.eventTitle}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    {new Date(event.date.seconds * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleAcceptEvent(event.id)}
                      disabled={event.acceptedParticipants?.includes(user?.uid)}
                      className="bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {event.acceptedParticipants?.includes(user?.uid)
                        ? "Accepted"
                        : "Accept"}
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
          <CardTitle>Submit Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <Input
              placeholder="Event Title"
              value={eventForm.eventTitle}
              onChange={(e) =>
                setEventForm({ ...eventForm, eventTitle: e.target.value })
              }
            />
            <Input
              placeholder="Venue"
              value={eventForm.venue}
              onChange={(e) =>
                setEventForm({ ...eventForm, venue: e.target.value })
              }
            />
            <Input
              type="date"
              value={eventForm.date}
              onChange={(e) =>
                setEventForm({ ...eventForm, date: e.target.value })
              }
            />
            <Input
              type="time"
              value={eventForm.time}
              onChange={(e) =>
                setEventForm({ ...eventForm, time: e.target.value })
              }
            />
            <Input
              type="tel"
              placeholder="Organizer Phone"
              value={eventForm.organizerPhone}
              onChange={(e) =>
                setEventForm({ ...eventForm, organizerPhone: e.target.value })
              }
            />
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Submit Event
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="mb-2"
          />
          <Button
            onClick={handleFeedbackSubmit}
            className="w-full bg-green-500 text-white hover:bg-green-600"
          >
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
}
