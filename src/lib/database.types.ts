export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      live_answers: {
        Row: {
          answer: string
          buzz_order: number | null
          buzzed_at: string | null
          id: number
          is_correct: boolean | null
          participant_id: string
          question_index: number
          question_number: number
          session_id: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          answer: string
          buzz_order?: number | null
          buzzed_at?: string | null
          id?: number
          is_correct?: boolean | null
          participant_id: string
          question_index: number
          question_number: number
          session_id: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          buzz_order?: number | null
          buzzed_at?: string | null
          id?: number
          is_correct?: boolean | null
          participant_id?: string
          question_index?: number
          question_number?: number
          session_id?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_answers_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "live_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_answers_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "session_participants_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_buzzer_state: {
        Row: {
          buzzer_locked: boolean | null
          created_at: string
          first_buzzer_participant_id: string | null
          id: number
          question_number: number
          session_id: string
        }
        Insert: {
          buzzer_locked?: boolean | null
          created_at?: string
          first_buzzer_participant_id?: string | null
          id?: number
          question_number: number
          session_id: string
        }
        Update: {
          buzzer_locked?: boolean | null
          created_at?: string
          first_buzzer_participant_id?: string | null
          id?: number
          question_number?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_buzzer_state_first_buzzer_participant_id_fkey"
            columns: ["first_buzzer_participant_id"]
            isOneToOne: false
            referencedRelation: "live_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_buzzer_state_first_buzzer_participant_id_fkey"
            columns: ["first_buzzer_participant_id"]
            isOneToOne: false
            referencedRelation: "session_participants_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_buzzer_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_participants: {
        Row: {
          id: string
          joined_at: string
          score: number
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          score?: number
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          score?: number
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          current_question_index: number
          host_id: string
          id: string
          join_code: string
          status: string
          test_type: string
          test_year: number
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          host_id: string
          id?: string
          join_code: string
          status?: string
          test_type: string
          test_year: number
        }
        Update: {
          created_at?: string
          current_question_index?: number
          host_id?: string
          id?: string
          join_code?: string
          status?: string
          test_type?: string
          test_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      question_topics: {
        Row: {
          question_id: string
          topic_id: number
        }
        Insert: {
          question_id: string
          topic_id: number
        }
        Update: {
          question_id?: string
          topic_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_topics_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          problem_html: string
          question_number: number
          solutions_html: Json | null
          test_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          problem_html: string
          question_number: number
          solutions_html?: Json | null
          test_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          problem_html?: string
          question_number?: number
          solutions_html?: Json | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          id: number
          score: number
          test_date: string
          time_taken: number | null
          topics: Json | null
          user_id: string
        }
        Insert: {
          id?: number
          score: number
          test_date?: string
          time_taken?: number | null
          topics?: Json | null
          user_id: string
        }
        Update: {
          id?: number
          score?: number
          test_date?: string
          time_taken?: number | null
          topics?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          competition: string
          id: string
          name: string
          scraped_at: string | null
          year: number
        }
        Insert: {
          competition: string
          id?: string
          name: string
          scraped_at?: string | null
          year: number
        }
        Update: {
          competition?: string
          id?: string
          name?: string
          scraped_at?: string | null
          year?: number
        }
        Relationships: []
      }
      topics: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      session_participants_with_profiles: {
        Row: {
          avatar: string | null
          id: string | null
          joined_at: string | null
          score: number | null
          session_id: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      buzz_in: {
        Args: {
          p_session_id: string
          p_participant_id: string
          p_question_number: number
        }
        Returns: Json
      }
      create_session_and_add_host: {
        Args: { p_test_type: string; p_test_year: number }
        Returns: string
      }
      distribute_session_rewards: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      get_competitions_by_type: {
        Args: { competition_patterns: string[] }
        Returns: {
          id: number
          name: string
          competition: string
        }[]
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          avatar: string
          total_xp: number
        }[]
      }
      get_random_questions: {
        Args: { p_competition: string; p_limit: number }
        Returns: {
          answer: string
          created_at: string | null
          id: string
          problem_html: string
          question_number: number
          solutions_html: Json | null
          test_id: string
        }[]
      }
      get_session_by_code: {
        Args: { p_join_code: string }
        Returns: string
      }
      get_session_participants: {
        Args: { p_session_id: string }
        Returns: {
          id: string
          joined_at: string
          score: number
          session_id: string
          user_id: string
        }[]
      }
      get_session_with_participants: {
        Args: { p_session_id: string }
        Returns: Json
      }
      get_session_with_participants_secure: {
        Args: { p_session_id: string }
        Returns: Json
      }
      get_test_by_session: {
        Args: { p_session_id: string }
        Returns: Json
      }
      increment_score: {
        Args: { participant_id_to_update: string; score_to_add: number }
        Returns: undefined
      }
      is_session_participant: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      join_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      reset_buzzer_state: {
        Args: { p_session_id: string; p_question_number: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
