export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tests: {
        Row: {
          id: string;
          name: string;
          year: number;
          competition: string;
          scraped_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          competition: string;
          scraped_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          year?: number;
          competition?: string;
          scraped_at?: string | null;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          test_id: string;
          question_number: number;
          problem_html: string;
          answer: string;
          solutions_html: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          test_id: string;
          question_number: number;
          problem_html: string;
          answer: string;
          solutions_html?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          test_id?: string;
          question_number?: number;
          problem_html?: string;
          answer?: string;
          solutions_html?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey";
            columns: ["test_id"];
            referencedRelation: "tests";
            referencedColumns: ["id"];
          }
        ];
      };
      question_topics: {
        Row: {
          question_id: string;
          topic_id: number;
        };
        Insert: {
          question_id: string;
          topic_id: number;
        };
        Update: {
          question_id?: string;
          topic_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_topics_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_topics_topic_id_fkey";
            columns: ["topic_id"];
            referencedRelation: "topics";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar: string | null;
        };
        Insert: {
          id: string;
          username: string;
          avatar?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          avatar?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      live_sessions: {
        Row: {
          id: string;
          created_at: string;
          host_id: string;
          test_id: string | null;
          status: string;
          join_code: string;
          current_question_index: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          host_id: string;
          test_id?: string | null;
          status?: string;
          join_code: string;
          current_question_index?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          host_id?: string;
          test_id?: string | null;
          status?: string;
          join_code?: string;
          current_question_index?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "live_sessions_host_id_fkey";
            columns: ["host_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_sessions_test_id_fkey";
            columns: ["test_id"];
            referencedRelation: "tests";
            referencedColumns: ["id"];
          }
        ];
      };
      live_participants: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          joined_at: string;
          score: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          joined_at?: string;
          score?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          joined_at?: string;
          score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_participants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      live_answers: {
        Row: {
          id: number;
          participant_id: string;
          question_number: number;
          answer: string;
          submitted_at: string;
          is_correct: boolean | null;
          buzzed_at: string | null;
          score_awarded: number | null;
          session_id: string | null;
        };
        Insert: {
          id?: number;
          participant_id: string;
          question_number: number;
          answer: string;
          submitted_at?: string;
          is_correct?: boolean | null;
          buzzed_at?: string | null;
          score_awarded?: number | null;
          session_id?: string | null;
        };
        Update: {
          id?: number;
          participant_id?: string;
          question_number?: number;
          answer?: string;
          submitted_at?: string;
          is_correct?: boolean | null;
          buzzed_at?: string | null;
          score_awarded?: number | null;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "live_answers_participant_id_fkey";
            columns: ["participant_id"];
            referencedRelation: "live_participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_answers_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      live_buzzer_state: {
        Row: {
          id: number;
          session_id: string;
          question_number: number;
          first_buzzer_participant_id: string | null;
          buzzer_locked: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          question_number: number;
          first_buzzer_participant_id?: string | null;
          buzzer_locked?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string;
          question_number?: number;
          first_buzzer_participant_id?: string | null;
          buzzer_locked?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_buzzer_state_first_buzzer_participant_id_fkey";
            columns: ["first_buzzer_participant_id"];
            referencedRelation: "live_participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_buzzer_state_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "live_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      buzz_in: {
        Args: {
          p_session_id: string;
          p_participant_id: string;
          p_question_number: number;
        };
        Returns: Json;
      };
      get_session_by_code: {
        Args: {
          p_join_code: string;
        };
        Returns: Json;
      };
      get_session_participants: {
        Args: {
          p_session_id: string;
        };
        Returns: Json;
      };
      get_test_by_session: {
        Args: {
          p_session_id: string;
        };
        Returns: Json;
      };
      increment_score: {
        Args: {
          participant_id_to_update: string;
          score_to_add: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
