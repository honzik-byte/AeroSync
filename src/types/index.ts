export type Aeroclub = {
  id: string
  slug: string
  name: string
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  global_role: "super_admin" | "user"
  created_at: string
}

export type Airplane = {
  id: string
  aeroclub_id: string
  name: string
  type: string
  created_at: string
}

export type Pilot = {
  id: string
  aeroclub_id: string
  name: string
  email: string | null
  created_at: string
}

export type AeroclubMember = {
  id: string
  aeroclub_id: string
  user_id: string
  role: "club_admin" | "pilot"
  status: "active" | "inactive"
  created_at: string
}

export type AeroclubInviteCode = {
  id: string
  aeroclub_id: string
  code: string
  is_active: boolean
  used_by_user_id: string | null
  used_at: string | null
  created_at: string
}

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled"

export type Booking = {
  id: string
  aeroclub_id: string
  airplane_id: string
  pilot_id: string
  start_time: string
  end_time: string
  status: BookingStatus
  requested_by_user_id: string | null
  approved_by_user_id: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      aeroclubs: {
        Row: Aeroclub
        Insert: {
          id?: string
          slug: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: {
          id: string
          email: string
          full_name: string
          global_role?: "super_admin" | "user"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          global_role?: "super_admin" | "user"
          created_at?: string
        }
        Relationships: []
      }
      airplanes: {
        Row: Airplane
        Insert: {
          id?: string
          aeroclub_id: string
          name: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          aeroclub_id?: string
          name?: string
          type?: string
          created_at?: string
        }
        Relationships: []
      }
      pilots: {
        Row: Pilot
        Insert: {
          id?: string
          aeroclub_id: string
          name: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aeroclub_id?: string
          name?: string
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      aeroclub_members: {
        Row: AeroclubMember
        Insert: {
          id?: string
          aeroclub_id: string
          user_id: string
          role: "club_admin" | "pilot"
          status?: "active" | "inactive"
          created_at?: string
        }
        Update: {
          id?: string
          aeroclub_id?: string
          user_id?: string
          role?: "club_admin" | "pilot"
          status?: "active" | "inactive"
          created_at?: string
        }
        Relationships: []
      }
      aeroclub_invite_codes: {
        Row: AeroclubInviteCode
        Insert: {
          id?: string
          aeroclub_id: string
          code: string
          is_active?: boolean
          used_by_user_id?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aeroclub_id?: string
          code?: string
          is_active?: boolean
          used_by_user_id?: string | null
          used_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: Booking
        Insert: {
          id?: string
          aeroclub_id: string
          airplane_id: string
          pilot_id: string
          start_time: string
          end_time: string
          status?: BookingStatus
          requested_by_user_id?: string | null
          approved_by_user_id?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aeroclub_id?: string
          airplane_id?: string
          pilot_id?: string
          start_time?: string
          end_time?: string
          status?: BookingStatus
          requested_by_user_id?: string | null
          approved_by_user_id?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
