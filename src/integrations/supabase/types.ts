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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          heading: string | null
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          subheading: string | null
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          heading?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          subheading?: string | null
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          heading?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subheading?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          email: string
          id: string
          items: Json
          order_no: number
          payment_method: string
          phone: string
          sender_number: string
          status: string
          total: number
          transaction_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          email: string
          id?: string
          items?: Json
          order_no?: number
          payment_method: string
          phone: string
          sender_number: string
          status?: string
          total?: number
          transaction_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          items?: Json
          order_no?: number
          payment_method?: string
          phone?: string
          sender_number?: string
          status?: string
          total?: number
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          id: string
          images: string[]
          is_best_selling: boolean
          is_suggested: boolean
          price: number
          rating: number
          review_count: number
          short_description: string | null
          slug: string
          status: string
          stock: number
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          images?: string[]
          is_best_selling?: boolean
          is_suggested?: boolean
          price?: number
          rating?: number
          review_count?: number
          short_description?: string | null
          slug: string
          status?: string
          stock?: number
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          images?: string[]
          is_best_selling?: boolean
          is_suggested?: boolean
          price?: number
          rating?: number
          review_count?: number
          short_description?: string | null
          slug?: string
          status?: string
          stock?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          avatar_url: string | null
          comment: string | null
          created_at: string
          id: string
          name: string
          product_id: string
          rating: number
        }
        Insert: {
          avatar_url?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          name: string
          product_id: string
          rating?: number
        }
        Update: {
          avatar_url?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          name?: string
          product_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          bkash_enabled: boolean
          bkash_number: string | null
          clarity_id: string | null
          email: string | null
          facebook_url: string | null
          favicon_url: string | null
          fb_capi_access_token: string | null
          fb_capi_enabled: boolean
          fb_pixel_id: string | null
          fb_test_event_code: string | null
          font_family: string
          footer_about: string | null
          footer_bg_color: string
          footer_contact_title: string
          footer_copyright: string | null
          footer_links_title: string
          footer_text_color: string
          ga_id: string | null
          ga4_id: string | null
          google_ads_conversion_label: string | null
          google_ads_id: string | null
          gtm_id: string | null
          header_bg_color: string
          header_show_search: boolean
          header_text_color: string
          hero_badge_text: string
          hero_bg_from: string
          hero_bg_style: string
          hero_bg_to: string
          hero_customers_text: string
          hero_delivery_badge_text: string
          hero_height_desktop: number
          hero_height_mobile: number
          hero_max_width: number
          hero_offer_image_url: string
          hero_secondary_cta_link: string
          hero_secondary_cta_text: string
          hero_trust_text: string
          id: number
          instagram_url: string | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          nagad_enabled: boolean
          nagad_number: string | null
          og_description: string | null
          og_image_url: string | null
          payment_instructions: string | null
          phone: string | null
          primary_color: string
          rocket_enabled: boolean
          rocket_number: string | null
          sec_all_subtitle: string
          sec_all_title: string
          sec_best_subtitle: string
          sec_best_title: string
          sec_categories_subtitle: string
          sec_categories_title: string
          sec_proof_subtitle: string
          sec_proof_title: string
          sec_suggested_subtitle: string
          sec_suggested_title: string
          sec_testimonials_subtitle: string
          sec_testimonials_title: string
          secondary_color: string
          show_all_products: boolean
          show_best_selling: boolean
          show_categories: boolean
          show_hero: boolean
          show_proofs: boolean
          show_suggested: boolean
          show_testimonials: boolean
          site_name: string
          site_tagline: string
          tiktok_pixel_id: string | null
          tiktok_url: string | null
          tracking_enabled: boolean
          updated_at: string
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          bkash_enabled?: boolean
          bkash_number?: string | null
          clarity_id?: string | null
          email?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          fb_capi_access_token?: string | null
          fb_capi_enabled?: boolean
          fb_pixel_id?: string | null
          fb_test_event_code?: string | null
          font_family?: string
          footer_about?: string | null
          footer_bg_color?: string
          footer_contact_title?: string
          footer_copyright?: string | null
          footer_links_title?: string
          footer_text_color?: string
          ga_id?: string | null
          ga4_id?: string | null
          google_ads_conversion_label?: string | null
          google_ads_id?: string | null
          gtm_id?: string | null
          header_bg_color?: string
          header_show_search?: boolean
          header_text_color?: string
          hero_badge_text?: string
          hero_bg_from?: string
          hero_bg_style?: string
          hero_bg_to?: string
          hero_customers_text?: string
          hero_delivery_badge_text?: string
          hero_height_desktop?: number
          hero_height_mobile?: number
          hero_max_width?: number
          hero_offer_image_url?: string
          hero_secondary_cta_link?: string
          hero_secondary_cta_text?: string
          hero_trust_text?: string
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nagad_enabled?: boolean
          nagad_number?: string | null
          og_description?: string | null
          og_image_url?: string | null
          payment_instructions?: string | null
          phone?: string | null
          primary_color?: string
          rocket_enabled?: boolean
          rocket_number?: string | null
          sec_all_subtitle?: string
          sec_all_title?: string
          sec_best_subtitle?: string
          sec_best_title?: string
          sec_categories_subtitle?: string
          sec_categories_title?: string
          sec_proof_subtitle?: string
          sec_proof_title?: string
          sec_suggested_subtitle?: string
          sec_suggested_title?: string
          sec_testimonials_subtitle?: string
          sec_testimonials_title?: string
          secondary_color?: string
          show_all_products?: boolean
          show_best_selling?: boolean
          show_categories?: boolean
          show_hero?: boolean
          show_proofs?: boolean
          show_suggested?: boolean
          show_testimonials?: boolean
          site_name?: string
          site_tagline?: string
          tiktok_pixel_id?: string | null
          tiktok_url?: string | null
          tracking_enabled?: boolean
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          bkash_enabled?: boolean
          bkash_number?: string | null
          clarity_id?: string | null
          email?: string | null
          facebook_url?: string | null
          favicon_url?: string | null
          fb_capi_access_token?: string | null
          fb_capi_enabled?: boolean
          fb_pixel_id?: string | null
          fb_test_event_code?: string | null
          font_family?: string
          footer_about?: string | null
          footer_bg_color?: string
          footer_contact_title?: string
          footer_copyright?: string | null
          footer_links_title?: string
          footer_text_color?: string
          ga_id?: string | null
          ga4_id?: string | null
          google_ads_conversion_label?: string | null
          google_ads_id?: string | null
          gtm_id?: string | null
          header_bg_color?: string
          header_show_search?: boolean
          header_text_color?: string
          hero_badge_text?: string
          hero_bg_from?: string
          hero_bg_style?: string
          hero_bg_to?: string
          hero_customers_text?: string
          hero_delivery_badge_text?: string
          hero_height_desktop?: number
          hero_height_mobile?: number
          hero_max_width?: number
          hero_offer_image_url?: string
          hero_secondary_cta_link?: string
          hero_secondary_cta_text?: string
          hero_trust_text?: string
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nagad_enabled?: boolean
          nagad_number?: string | null
          og_description?: string | null
          og_image_url?: string | null
          payment_instructions?: string | null
          phone?: string | null
          primary_color?: string
          rocket_enabled?: boolean
          rocket_number?: string | null
          sec_all_subtitle?: string
          sec_all_title?: string
          sec_best_subtitle?: string
          sec_best_title?: string
          sec_categories_subtitle?: string
          sec_categories_title?: string
          sec_proof_subtitle?: string
          sec_proof_title?: string
          sec_suggested_subtitle?: string
          sec_suggested_title?: string
          sec_testimonials_subtitle?: string
          sec_testimonials_title?: string
          secondary_color?: string
          show_all_products?: boolean
          show_best_selling?: boolean
          show_categories?: boolean
          show_hero?: boolean
          show_proofs?: boolean
          show_suggested?: boolean
          show_testimonials?: boolean
          site_name?: string
          site_tagline?: string
          tiktok_pixel_id?: string | null
          tiktok_url?: string | null
          tracking_enabled?: boolean
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          comment: string
          created_at: string
          id: string
          name: string
          rating: number
          sort_order: number
        }
        Insert: {
          avatar_url?: string | null
          comment: string
          created_at?: string
          id?: string
          name: string
          rating?: number
          sort_order?: number
        }
        Update: {
          avatar_url?: string | null
          comment?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      place_order: {
        Args: {
          p_customer_name: string
          p_email: string
          p_items: Json
          p_payment_method: string
          p_phone: string
          p_sender_number: string
          p_transaction_id: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
