"use client";
import { useEffect } from "react";
import { submitEvent } from "@/lib/db";

export default function Test() {
  useEffect(() => {
    submitEvent({
      eventTitle: "Test Event",
      description: "A test event",
      venue: "Room 101",
      date: new Date(),
      time: "14:00",
      createdBy: "test_user", // Replace with auth user later
    }).then((docRef) => console.log("Event created:", docRef.id));
  }, []);

  return <div>Check console for event creation</div>;
}
