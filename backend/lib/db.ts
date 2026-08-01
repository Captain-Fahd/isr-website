import { supabaseAdmin } from "./supabase";

export type Event = {
  id: number;
  name: string;
  date: string;
  imageUrl: string;
  description: string;
  ticketUrl: string | null;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  imageUrl: string | null;
  createdAt: string;
};

function throwOnError<T>(result: {
  data: T;
  error: { message: string } | null;
}): T {
  if (result.error) throw result.error;
  return result.data;
}

export async function listEvents(
  filter?: "upcoming" | "past",
): Promise<Event[]> {
  const now = new Date().toISOString();
  let query = supabaseAdmin.from("Event").select("*");

  if (filter === "upcoming") {
    query = query.gte("date", now).order("date", { ascending: true });
  } else if (filter === "past") {
    query = query.lt("date", now).order("date", { ascending: false });
  } else {
    query = query.order("date", { ascending: true });
  }

  return throwOnError(await query) as Event[];
}

export async function getEventById(id: number): Promise<Event | null> {
  const { data, error } = await supabaseAdmin
    .from("Event")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Event | null;
}

export async function createEvent(
  data: Omit<Event, "id">,
): Promise<Event> {
  return throwOnError(
    await supabaseAdmin.from("Event").insert(data).select().single(),
  ) as Event;
}

export async function updateEvent(
  id: number,
  data: Partial<Omit<Event, "id">>,
): Promise<Event> {
  return throwOnError(
    await supabaseAdmin.from("Event").update(data).eq("id", id).select().single(),
  ) as Event;
}

export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabaseAdmin.from("Event").delete().eq("id", id);
  if (error) throw error;
}

export async function listAnnouncements(): Promise<Announcement[]> {
  return throwOnError(
    await supabaseAdmin
      .from("Announcement")
      .select("*")
      .order("pinned", { ascending: false })
      .order("createdAt", { ascending: false }),
  ) as Announcement[];
}

export async function getAnnouncementById(
  id: number,
): Promise<Announcement | null> {
  const { data, error } = await supabaseAdmin
    .from("Announcement")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Announcement | null;
}

export async function createAnnouncement(
  data: Omit<Announcement, "id" | "createdAt">,
): Promise<Announcement> {
  return throwOnError(
    await supabaseAdmin.from("Announcement").insert(data).select().single(),
  ) as Announcement;
}

export async function updateAnnouncement(
  id: number,
  data: Partial<Omit<Announcement, "id" | "createdAt">>,
): Promise<Announcement> {
  return throwOnError(
    await supabaseAdmin
      .from("Announcement")
      .update(data)
      .eq("id", id)
      .select()
      .single(),
  ) as Announcement;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("Announcement")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
