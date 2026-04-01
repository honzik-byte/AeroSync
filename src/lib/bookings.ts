import type { CurrentUser } from "@/lib/currentUser";
import type { BookingStatus } from "@/types";

type BookingWindow = {
  start_time: string;
  end_time: string;
};

type BookingWithId = BookingWindow & {
  id: string;
  status?: BookingStatus | string | null;
};

export function bookingBlocksSlot(status: BookingStatus | string | null | undefined) {
  if (status == null) {
    return true;
  }

  return status === "pending" || status === "approved";
}

export function validateBookingWindow(window: BookingWindow) {
  const start = new Date(window.start_time).getTime();
  const end = new Date(window.end_time).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error("Neplatný formát času rezervace.");
  }

  if (end <= start) {
    throw new Error("Konec rezervace musí být později než začátek.");
  }
}

export function bookingOverlaps(a: BookingWindow, b: BookingWindow) {
  const aStart = new Date(a.start_time).getTime();
  const aEnd = new Date(a.end_time).getTime();
  const bStart = new Date(b.start_time).getTime();
  const bEnd = new Date(b.end_time).getTime();

  return aStart < bEnd && aEnd > bStart;
}

export function ensureNoBookingConflict(
  candidate: BookingWindow,
  existing: BookingWithId[],
  ignoredBookingId?: string,
) {
  const hasConflict = existing.some((item) => {
    if (ignoredBookingId && item.id === ignoredBookingId) {
      return false;
    }

    if (!bookingBlocksSlot(item.status)) {
      return false;
    }

    return bookingOverlaps(candidate, item);
  });

  if (hasConflict) {
    throw new Error("V tomto čase už je letadlo rezervované.");
  }
}

export function ensureBookingPilotAccess(
  currentUser: CurrentUser,
  requestedPilotId: string,
) {
  if (currentUser.role !== "pilot") {
    return;
  }

  if (!currentUser.authUser?.id || currentUser.authUser.id !== requestedPilotId) {
    throw new Error("Pilot může vytvářet rezervace jen sám pro sebe.");
  }
}
