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
          id: string
          user_id: string | null
          email: string
          full_name: string
          temp_password: string | null
          branch_ids: string[]
          permissions: string[]
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          full_name: string
          temp_password?: string | null
          branch_ids?: string[]
          permissions?: string[]
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          full_name?: string
          temp_password?: string | null
          branch_ids?: string[]
          permissions?: string[]
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          id: string
          name: string
          slug: string
          location: string | null
          description: string | null
          leader_name: string | null
          leader_user_id: string | null
          leader_email: string | null
          phone: string | null
          logo_url: string | null
          banner_url: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          location?: string | null
          description?: string | null
          leader_name?: string | null
          leader_user_id?: string | null
          leader_email?: string | null
          phone?: string | null
          logo_url?: string | null
          banner_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          location?: string | null
          description?: string | null
          leader_name?: string | null
          leader_user_id?: string | null
          leader_email?: string | null
          phone?: string | null
          logo_url?: string | null
          banner_url?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      branch_members: {
        Row: {
          id: string
          branch_id: string
          user_id: string | null
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          user_id?: string | null
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          user_id?: string | null
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      membership_requests: {
        Row: {
          id: string
          branch_id: string
          full_name: string
          email: string
          phone: string | null
          message: string | null
          status: string | null
          temp_password: string | null
          created_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          full_name: string
          email: string
          phone?: string | null
          message?: string | null
          status?: string | null
          temp_password?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          message?: string | null
          status?: string | null
          temp_password?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      member_login_credentials: {
        Row: {
          id: string
          branch_id: string
          membership_request_id: string | null
          email: string
          full_name: string
          temp_password: string
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          membership_request_id?: string | null
          email: string
          full_name: string
          temp_password: string
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          membership_request_id?: string | null
          email?: string
          full_name?: string
          temp_password?: string
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_login_credentials_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      branch_events: {
        Row: {
          id: string
          branch_id: string
          title: string
          description: string | null
          scheduled_at: string
          stream_url: string | null
          location: string | null
          is_live: boolean | null
          image_url: string | null
          images: string[] | null
          event_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          title: string
          description?: string | null
          scheduled_at: string
          stream_url?: string | null
          location?: string | null
          is_live?: boolean | null
          image_url?: string | null
          images?: string[] | null
          event_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          title?: string
          description?: string | null
          scheduled_at?: string
          stream_url?: string | null
          location?: string | null
          is_live?: boolean | null
          image_url?: string | null
          images?: string[] | null
          event_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      branch_services: {
        Row: {
          id: string
          branch_id: string
          title: string
          description: string | null
          icon: string | null
          bible_verse: string | null
          active: boolean | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          title: string
          description?: string | null
          icon?: string | null
          bible_verse?: string | null
          active?: boolean | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          title?: string
          description?: string | null
          icon?: string | null
          bible_verse?: string | null
          active?: boolean | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_services_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      branch_episodes: {
        Row: {
          id: string
          branch_id: string
          title: string
          description: string | null
          audio_url: string | null
          thumbnail_url: string | null
          category: string | null
          duration: string | null
          published: boolean | null
          featured: boolean | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          title: string
          description?: string | null
          audio_url?: string | null
          thumbnail_url?: string | null
          category?: string | null
          duration?: string | null
          published?: boolean | null
          featured?: boolean | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          title?: string
          description?: string | null
          audio_url?: string | null
          thumbnail_url?: string | null
          category?: string | null
          duration?: string | null
          published?: boolean | null
          featured?: boolean | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_episodes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      branch_donations: {
        Row: {
          id: string
          branch_id: string
          user_id: string | null
          donor_name: string | null
          donor_email: string | null
          amount: number
          currency: string | null
          frequency: string | null
          message: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          user_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          amount: number
          currency?: string | null
          frequency?: string | null
          message?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          user_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          amount?: number
          currency?: string | null
          frequency?: string | null
          message?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_donations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      branch_prayers: {
        Row: {
          id: string
          branch_id: string
          user_id: string | null
          name: string
          request: string
          is_anonymous: boolean | null
          status: string | null
          prayed_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          user_id?: string | null
          name: string
          request: string
          is_anonymous?: boolean | null
          status?: string | null
          prayed_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          user_id?: string | null
          name?: string
          request?: string
          is_anonymous?: boolean | null
          status?: string | null
          prayed_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_prayers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      store_items: {
        Row: {
          id: string
          branch_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          active: boolean | null
          stock: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          active?: boolean | null
          stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          active?: boolean | null
          stock?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
        ]
      }
      store_orders: {
        Row: {
          id: string
          branch_id: string
          user_id: string | null
          customer_name: string | null
          customer_email: string | null
          items: Json
          total: number
          status: string | null
          shipping_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          user_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          items?: Json
          total: number
          status?: string | null
          shipping_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          user_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          items?: Json
          total?: number
          status?: string | null
          shipping_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          }
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
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          section: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          section?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          section?: string
          updated_at?: string
          value?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_branch_leader: {
        Args: {
          _branch_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_branch_admin: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
      branch_admin_can: {
        Args: {
          _user_id: string
          _permission: string
        }
        Returns: boolean
      }
      branch_admin_manages: {
        Args: {
          _user_id: string
          _branch_id: string
        }
        Returns: boolean
      }
      link_branch_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      my_branch_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
          branch_ids: string[]
          permissions: string[]
          is_active: boolean
        }[]
      }
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
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
