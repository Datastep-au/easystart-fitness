// Generated types for Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          pillar: string
          name: string
          cues: string[] | null
          regress: string | null
          progress: string | null
          default_reps: string | null
          default_rest_sec: number | null
          is_public: boolean | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pillar: string
          name: string
          cues?: string[] | null
          regress?: string | null
          progress?: string | null
          default_reps?: string | null
          default_rest_sec?: number | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pillar?: string
          name?: string
          cues?: string[] | null
          regress?: string | null
          progress?: string | null
          default_reps?: string | null
          default_rest_sec?: number | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      workout_templates: {
        Row: {
          id: string
          pillar: string
          name: string
          description: string | null
          difficulty: string | null
          is_public: boolean | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pillar: string
          name: string
          description?: string | null
          difficulty?: string | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pillar?: string
          name?: string
          description?: string | null
          difficulty?: string | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      workout_template_items: {
        Row: {
          id: string
          template_id: string
          exercise_id: string | null
          name: string | null
          reps: string | null
          notes: string | null
          rest_sec: number | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          template_id: string
          exercise_id?: string | null
          name?: string | null
          reps?: string | null
          notes?: string | null
          rest_sec?: number | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          template_id?: string
          exercise_id?: string | null
          name?: string | null
          reps?: string | null
          notes?: string | null
          rest_sec?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      interval_sets: {
        Row: {
          id: string
          pillar: string
          name: string
          warmup_sec: number | null
          cooldown_sec: number | null
          steps: Json
          est_total_min: number | null
          difficulty: string | null
          is_public: boolean | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pillar: string
          name: string
          warmup_sec?: number | null
          cooldown_sec?: number | null
          steps: Json
          est_total_min?: number | null
          difficulty?: string | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pillar?: string
          name?: string
          warmup_sec?: number | null
          cooldown_sec?: number | null
          steps?: Json
          est_total_min?: number | null
          difficulty?: string | null
          is_public?: boolean | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interval_sets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      preferences: {
        Row: {
          user_id: string
          week_length: number | null
          days_per_week: number | null
          max_duration_min: number | null
          default_mode: string | null
          fitness_level: string | null
          pillars: string[] | null
          primary_focus: string | null
          equipment: Json | null
        }
        Insert: {
          user_id: string
          week_length?: number | null
          days_per_week?: number | null
          max_duration_min?: number | null
          default_mode?: string | null
          fitness_level?: string | null
          pillars?: string[] | null
          primary_focus?: string | null
          equipment?: Json | null
        }
        Update: {
          user_id?: string
          week_length?: number | null
          days_per_week?: number | null
          max_duration_min?: number | null
          default_mode?: string | null
          fitness_level?: string | null
          pillars?: string[] | null
          primary_focus?: string | null
          equipment?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      programs: {
        Row: {
          id: string
          user_id: string
          start_date: string | null
          length_weeks: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date?: string | null
          length_weeks: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string | null
          length_weeks?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      program_weeks: {
        Row: {
          id: string
          program_id: string
          week_number: number
          theme: string | null
        }
        Insert: {
          id?: string
          program_id: string
          week_number: number
          theme?: string | null
        }
        Update: {
          id?: string
          program_id?: string
          week_number?: number
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      }
      program_days: {
        Row: {
          id: string
          program_id: string
          week_number: number
          day_of_week: number
          mode: string | null
          workout_template_id: string | null
          interval_set_id: string | null
          blocks: Json | null
          est_total_min: number | null
        }
        Insert: {
          id?: string
          program_id: string
          week_number: number
          day_of_week: number
          mode?: string | null
          workout_template_id?: string | null
          interval_set_id?: string | null
          blocks?: Json | null
          est_total_min?: number | null
        }
        Update: {
          id?: string
          program_id?: string
          week_number?: number
          day_of_week?: number
          mode?: string | null
          workout_template_id?: string | null
          interval_set_id?: string | null
          blocks?: Json | null
          est_total_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_interval_set_id_fkey"
            columns: ["interval_set_id"]
            isOneToOne: false
            referencedRelation: "interval_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_days_workout_template_id_fkey"
            columns: ["workout_template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          program_id: string | null
          week_number: number | null
          day_of_week: number | null
          completed: boolean | null
          duration_actual_min: number | null
          rpe: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          program_id?: string | null
          week_number?: number | null
          day_of_week?: number | null
          completed?: boolean | null
          duration_actual_min?: number | null
          rpe?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          program_id?: string | null
          week_number?: number | null
          day_of_week?: number | null
          completed?: boolean | null
          duration_actual_min?: number | null
          rpe?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}