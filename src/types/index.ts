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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "airplanes_aeroclub_id_fkey"
            columns: ["aeroclub_id"]
            referencedRelation: "aeroclubs"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "pilots_aeroclub_id_fkey"
            columns: ["aeroclub_id"]
            referencedRelation: "aeroclubs"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "aeroclub_members_aeroclub_id_fkey"
            columns: ["aeroclub_id"]
            referencedRelation: "aeroclubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeroclub_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "aeroclub_invite_codes_aeroclub_id_fkey"
            columns: ["aeroclub_id"]
            referencedRelation: "aeroclubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aeroclub_invite_codes_used_by_user_id_fkey"
            columns: ["used_by_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "bookings_aeroclub_id_fkey"
            columns: ["aeroclub_id"]
            referencedRelation: "aeroclubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_airplane_aeroclub_fk"
            columns: ["airplane_id", "aeroclub_id"]
            referencedRelation: "airplanes"
            referencedColumns: ["id", "aeroclub_id"]
          },
          {
            foreignKeyName: "bookings_pilot_aeroclub_fk"
            columns: ["pilot_id", "aeroclub_id"]
            referencedRelation: "pilots"
            referencedColumns: ["id", "aeroclub_id"]
          },
          {
            foreignKeyName: "bookings_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
