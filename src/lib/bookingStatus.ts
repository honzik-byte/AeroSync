import type { BookingStatus } from "@/types"

export const activeBookingStatuses = ["pending", "approved"] as const satisfies readonly BookingStatus[]

export type ActiveBookingStatus = (typeof activeBookingStatuses)[number]

export function isActiveBookingStatus(status: BookingStatus | string): status is ActiveBookingStatus {
  return activeBookingStatuses.includes(status as ActiveBookingStatus)
}
