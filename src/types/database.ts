export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ad_media: {
        Row: {
          ad_id: string | null
          created_at: string | null
          id: string
          original_url: string
          source_type: string
          thumbnail_url: string | null
          validation_status: string | null
        }
        Insert: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          original_url: string
          source_type: string
          thumbnail_url?: string | null
          validation_status?: string | null
        }
        Update: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          original_url?: string
          source_type?: string
          thumbnail_url?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_media_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          }
        ]
      }
      ad_status_history: {
        Row: {
          ad_id: string | null
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: string
          note: string | null
          previous_status: string | null
        }
        Insert: {
          ad_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: string
          note?: string | null
          previous_status?: string | null
        }
        Update: {
          ad_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string
          note?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_status_history_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ads: {
        Row: {
          admin_boost: number | null
          category_id: string | null
          city_id: string | null
          contact_phone: string | null
          created_at: string | null
          description: string
          expire_at: string | null
          id: string
          is_featured: boolean | null
          package_id: string | null
          price: number | null
          publish_at: string | null
          rank_score: number | null
          slug: string
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_boost?: number | null
          category_id?: string | null
          city_id?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description: string
          expire_at?: string | null
          id?: string
          is_featured?: boolean | null
          package_id?: string | null
          price?: number | null
          publish_at?: string | null
          rank_score?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_boost?: number | null
          category_id?: string | null
          city_id?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string
          expire_at?: string | null
          id?: string
          is_featured?: boolean | null
          package_id?: string | null
          price?: number | null
          publish_at?: string | null
          rank_score?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      learning_questions: {
        Row: {
          answer: string
          created_at: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          question: string
          topic: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          topic?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          topic?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          weight: number
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          weight?: number
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          weight?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          ad_id: string | null
          admin_note: string | null
          amount: number
          created_at: string | null
          id: string
          method: string
          screenshot_url: string | null
          sender_name: string | null
          status: string | null
          transaction_ref: string | null
          updated_at: string | null
        }
        Insert: {
          ad_id?: string | null
          admin_note?: string | null
          amount: number
          created_at?: string | null
          id?: string
          method: string
          screenshot_url?: string | null
          sender_name?: string | null
          status?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_id?: string | null
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          screenshot_url?: string | null
          sender_name?: string | null
          status?: string | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          }
        ]
      }
      seller_profiles: {
        Row: {
          business_name: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      system_health_logs: {
        Row: {
          checked_at: string | null
          id: string
          response_ms: number | null
          source: string
          status: string | null
        }
        Insert: {
          checked_at?: string | null
          id?: string
          response_ms?: number | null
          source: string
          status?: string | null
        }
        Update: {
          checked_at?: string | null
          id?: string
          response_ms?: number | null
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
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
