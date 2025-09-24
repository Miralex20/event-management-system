"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { submitEvent } from "@/lib/db";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function EventForm() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      eventTitle: "",
      description: "",
      venue: "",
      date: "",
      time: "",
    },
    mode: "onChange", // Validate as user types
  });

  const onSubmit = async (data: any) => {
    if (!user) return toast.error("Please log in to submit an event");
    const eventData = {
      ...data,
      createdBy: user.uid,
      date: new Date(data.date),
      targetDepartments: [], // Add later if needed
    };
    await submitEvent(eventData);
    toast.success("Event submitted!");
    router.push("/dashboard/student");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="eventTitle"
          rules={{ required: "Event title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter event title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="venue"
          rules={{ required: "Venue is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter venue" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          rules={{ required: "Time is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!form.formState.isValid}>
          Submit Event
        </Button>
      </form>
      <ToastContainer />
    </Form>
  );
}
