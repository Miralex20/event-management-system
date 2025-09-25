import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";

export const submitEvent = async (eventData: {
  eventTitle: string;
  venue: string;
  dateTime: string;
  organizerPhone: string;
}) => {
  try {
    await addDoc(collection(db, "events"), {
      eventTitle: eventData.eventTitle,
      venue: eventData.venue,
      date: new Date(eventData.dateTime),
      status: "pending",
      approvedBy: [],
      createdAt: new Date().toISOString(),
      organizerPhone: eventData.organizerPhone,
    });
  } catch (error) {
    console.error("Error submitting event:", error);
    throw error;
  }
};

export const submitFeedback = async (feedbackData: {
  text: string;
  submittedBy: string;
}) => {
  try {
    await addDoc(collection(db, "feedback"), {
      ...feedbackData,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const approveEvent = async (eventId: string, adminId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: "approved",
      approvedBy: [adminId],
    });
  } catch (error) {
    console.error("Error approving event:", error);
    throw error;
  }
};

export const acceptEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      AcceptedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error accepting event:", error);
    throw error;
  }
};

export const rejectEvent = async (
  eventId: string,
  adminId: string,
  reason: string
) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: "rejected",
      approvedBy: [],
      rejectionReason: reason,
    });
  } catch (error) {
    console.error("Error rejecting event:", error);
    throw error;
  }
};
