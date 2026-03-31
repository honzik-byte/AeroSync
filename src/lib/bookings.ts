type BookingWindow = {
  start_time: string;
  end_time: string;
};

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
