export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      live_answers: {
        Row: {
          answer: string;
          id: number;
          is_correct: boolean | null;
          participant_id: string;
          question_number: number;
          submitted_at: string;
        };
        Insert: {
          answer: string;
          id?: number;
          is_correct?: boolean | null;
          participant_id: string;
          question_number: number;
          submitted_at?: string;
        };
        Update: {
          answer?: string;
          id?: number;
          is_correct?: boolean | null;
          participant_id?: string;
          question_number?: number;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_answers_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "live_participants";
            referencedColumns: ["id"];
          }
        ];
      };
      live_participants: {
        Row: {
          id: string;
          joined_at: string;
          score: number;
          session_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          score?: number;
          session_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          score?: number;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      live_sessions: {
        Row: {
          created_at: string;
          current_question_index: number;
          host_id: string;
          id: string;
          join_code: string;
          status: string;
          test_type: string;
          test_year: number;
        };
        Insert: {
          created_at?: string;
          current_question_index?: number;
          host_id: string;
          id?: string;
          join_code: string;
          status?: string;
          test_type: string;
          test_year: number;
        };
        Update: {
          created_at?: string;
          current_question_index?: number;
          host_id?: string;
          id?: string;
          join_code?: string;
          status?: string;
          test_type?: string;
          test_year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "live_sessions_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      session_participants_with_profiles: {
        Row: {
          avatar: string | null;
          id: string | null;
          joined_at: string | null;
          score: number | null;
          session_id: string | null;
          user_id: string | null;
          username: string | null;
        };
        Insert: {
          avatar?: string | null;
          id?: string | null;
          joined_at?: string | null;
          score?: number | null;
          session_id?: string | null;
          user_id?: string | null;
          username?: string | null;
        };
        Update: {
          avatar?: string | null;
          id?: string | null;
          joined_at?: string | null;
          score?: number | null;
          session_id?: string | null;
          user_id?: string | null;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      create_session_and_add_host: {
        Args: {
          p_test_type: string;
          p_test_year: number;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
