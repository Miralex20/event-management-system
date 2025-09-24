import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import twilio from "twilio";
import { arrayUnion } from "firebase/firestore";

// Twilio configuration (replace with your credentials)
const accountSid = "AC1761711c2630c93490c30044ed1724f1";
const authToken = "f1e37b755a6bcb1f7f4955882bc79fb8";
const twilioPhoneNumber = "+16269974492"; // e.g., "+1234567890"
const client = twilio(accountSid, authToken);

export const submitEvent = async (eventData: {
  eventTitle: string;
  venue: string;
  dateTime: string;
  submittedBy: string;
  participants: string[];
}) => {
  try {
    await addDoc(collection(db, "events"), {
      eventTitle: eventData.eventTitle,
      venue: eventData.venue,
      date: new Date(eventData.dateTime),
      status: "pending",
      approvedBy: [],
      createdAt: new Date().toISOString(),
      submittedBy: eventData.submittedBy,
      participants: eventData.participants || [],
      acceptedParticipants: [],
      notificationScheduledTime: null, // Default null
      notificationTarget: null, // "bulk" or "targeted"
      notificationSent: false,
    });
  } catch (error) {
    console.error("Error submitting event:", error);
    throw error;
  }
};

export const scheduleNotification = async (
  eventId: string,
  scheduledTime: string,
  target: "bulk" | "targeted"
) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      notificationScheduledTime: new Date(scheduledTime),
      notificationTarget: target,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
};

export const sendScheduledNotifications = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    const eventData = eventSnap.data();
    if (!eventData || eventData.notificationSent) return;

    const message = `Event "${
      eventData.eventTitle
    }" is scheduled! Date: ${new Date(
      eventData.date
    ).toLocaleString()}, Venue: ${eventData.venue}`;
    let userIds: string[] = [];

    if (eventData.notificationTarget === "targeted") {
      userIds = eventData.acceptedParticipants || [];
    } else if (eventData.notificationTarget === "bulk") {
      // Query all students
      const q = query(collection(db, "users"));
      const usersSnapshot = await getDocs(q);
      userIds = usersSnapshot.docs.map((doc) => doc.id);
    }

    for (const userId of userIds) {
      const userDoc = await getDoc(doc(db, "users", userId));
      const phoneNumber = userDoc.data()?.phoneNumber;
      if (phoneNumber) {
        await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });
      }
    }

    // Mark as sent
    await updateDoc(eventRef, { notificationSent: true });
  } catch (error) {
    console.error("Error sending scheduled notifications:", error);
    throw error;
  }
};

// Other functions remain the same...
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

export const acceptEvent = async (eventId: string, userId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      acceptedParticipants: arrayUnion(userId),
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
