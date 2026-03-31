export function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Prague"
  }).format(date);
}

export function buildTimeSlots(startHour: number, endHour: number) {
  const result: string[] = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    for (const minute of [0, 15, 30, 45]) {
      result.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }

  return result;
}
