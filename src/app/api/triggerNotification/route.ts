import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import twilio from "twilio";

// Twilio configuration (store in environment variables for security)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error(
    "Twilio credentials are not configured in environment variables"
  );
}

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  const { eventId, adminId } = await request.json();

  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    const eventData = eventSnap.data();
    if (!eventData || eventData.status !== "approved") {
      return NextResponse.json(
        { error: "Event not approved or not found" },
        { status: 400 }
      );
    }

    const {
      organizerPhone,
      participantPhones = [],
      eventTitle,
      venue,
      date,
    } = eventData;
    const phoneNumbers = [organizerPhone, ...participantPhones];
    const message = `Event "${eventTitle}" notification! Date: ${new Date(
      date.seconds * 1000
    ).toLocaleString()}, Venue: ${venue}`;

    for (const phoneNumber of phoneNumbers) {
      if (phoneNumber) {
        await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notifications triggered successfully",
    });
  } catch (error) {
    console.error("Error triggering notification:", error);
    return NextResponse.json(
      { error: "Failed to trigger notifications" },
      { status: 500 }
    );
  }
}
