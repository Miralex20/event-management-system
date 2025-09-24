import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import twilio from "twilio";

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

    // Fetch event details
    const eventSnapshot = await onSnapshot(
      doc(db, "events", eventId),
      (doc) => {
        const eventData = doc.data();
        if (eventData) {
          // Assume submittedBy is the organizer; extend to include participants if needed
          const organizerId = eventData.submittedBy;
          // Fetch organizer's phone number (example logic; adjust based on your user data)
          onSnapshot(doc(db, "users", organizerId), (userDoc) => {
            const phoneNumber = userDoc.data()?.phoneNumber; // Ensure phoneNumber is in user doc
            if (phoneNumber) {
              const message = `Event "${
                eventData.eventTitle
              }" approved! Date: ${new Date(
                eventData.date
              ).toLocaleString()}, Venue: ${eventData.venue}`;
              client.messages
                .create({
                  body: message,
                  from: twilioPhoneNumber,
                  to: phoneNumber,
                })
                .then((message) => console.log("SMS sent:", message.sid))
                .catch((error) => console.error("Error sending SMS:", error));
            }
          });
        }
      }
    );
  } catch (error) {
    console.error("Error approving event:", error);
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
