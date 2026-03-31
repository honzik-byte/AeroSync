export type Aeroclub = {
  id: string
  slug: string
  name: string
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

export type Booking = {
  id: string
  aeroclub_id: string
  airplane_id: string
  pilot_id: string
  start_time: string
  end_time: string
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
      bookings: {
        Row: Booking
        Insert: {
          id?: string
          aeroclub_id: string
          airplane_id: string
          pilot_id: string
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          aeroclub_id?: string
          airplane_id?: string
          pilot_id?: string
          start_time?: string
          end_time?: string
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
