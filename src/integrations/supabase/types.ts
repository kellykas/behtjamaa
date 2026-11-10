export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      branch_admins: {
        Row: {
          branch_ids: string[]
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          permissions: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_ids?: string[]
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          permissions?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_ids?: string[]
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          permissions?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      branch_donations: {
        Row: {
          amount: number
          branch_id: string
          created_at: string | null
          currency: string | null
          donor_email: string | null
          donor_name: string | null
          frequency: string | null
          id: string
          message: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          branch_id: string
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string | null
          id?: string
          message?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string
          created_at?: string | null
          currency?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string | null
          id?: string
          message?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_donations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_episodes: {
        Row: {
          audio_url: string | null
          branch_id: string
          category: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          featured: boolean | null
          id: string
          published: boolean | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          branch_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          branch_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_episodes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_events: {
        Row: {
          branch_id: string
          created_at: string | null
          description: string | null
          event_status: string | null
          id: string
          image_url: string | null
          images: Json | null
          is_live: boolean | null
          location: string | null
          scheduled_at: string
          stream_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          description?: string | null
          event_status?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_live?: boolean | null
          location?: string | null
          scheduled_at: string
          stream_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          description?: string | null
          event_status?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_live?: boolean | null
          location?: string | null
          scheduled_at?: string
          stream_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_members: {
        Row: {
          branch_id: string
          has_login: boolean | null
          id: string
          joined_at: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          branch_id: string
          has_login?: boolean | null
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          has_login?: boolean | null
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_prayers: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          name: string
          prayed_count: number | null
          request: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          name: string
          prayed_count?: number | null
          request: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          name?: string
          prayed_count?: number | null
          request?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_prayers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_services: {
        Row: {
          active: boolean | null
          bible_verse: string | null
          branch_id: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          bible_verse?: string | null
          branch_id: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          bible_verse?: string | null
          branch_id?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_services_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          active: boolean | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_state_branch: boolean
          leader_email: string | null
          leader_name: string | null
          leader_user_id: string | null
          location: string | null
          logo_url: string | null
          name: string
          parent_id: string | null
          phone: string | null
          slug: string
          state_code: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_state_branch?: boolean
          leader_email?: string | null
          leader_name?: string | null
          leader_user_id?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          parent_id?: string | null
          phone?: string | null
          slug: string
          state_code?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_state_branch?: boolean
          leader_email?: string | null
          leader_name?: string | null
          leader_user_id?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          parent_id?: string | null
          phone?: string | null
          slug?: string
          state_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean | null
          id: string
          published: boolean | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_live: boolean | null
          scheduled_at: string
          stream_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean | null
          scheduled_at: string
          stream_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_live?: boolean | null
          scheduled_at?: string
          stream_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_requests: {
        Row: {
          branch_id: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          name: string
          prayed_count: number | null
          request: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          name: string
          prayed_count?: number | null
          request: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          name?: string
          prayed_count?: number | null
          request?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          bible_verse: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          bible_verse?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          bible_verse?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          key: string
          section: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          key: string
          section?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          key?: string
          section?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      store_items: {
        Row: {
          active: boolean | null
          branch_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          branch_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          branch_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          branch_id: string
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          items: Json
          shipping_address: string | null
          status: string | null
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          items?: Json
          shipping_address?: string | null
          status?: string | null
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          items?: Json
          shipping_address?: string | null
          status?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      team_founders: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          name: string
          role: string
          sort_order: number | null
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          role: string
          sort_order?: number | null
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          sort_order?: number | null
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          name: string
          role: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          role: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      branch_admin_can: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      branch_admin_manages: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      derive_state_code_from_name: { Args: { name: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_branch_admin: { Args: { _user_id: string }; Returns: boolean }
      is_branch_leader: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      link_branch_admin: { Args: never; Returns: boolean }
      my_branch_admin: {
        Args: never
        Returns: {
          branch_ids: string[]
          email: string
          full_name: string
          id: string
          is_active: boolean
          permissions: string[]
        }[]
      }
      normalize_state_code: { Args: { raw: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
