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
      clients: {
        Row: {
          billing_address: string | null
          company_id: string
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          billing_address?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          billing_address?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          gstin: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          city: string | null
          company_id: string
          country: string | null
          created_at: string | null
          credit_note_title: string | null
          default_cgst_pct: number | null
          default_igst_pct: number | null
          default_note: string | null
          default_sgst_pct: number | null
          due_days: number | null
          email: string | null
          hsn_code: string | null
          invoice_prefix: string | null
          invoice_title: string | null
          logo_scale: number | null
          logo_url: string | null
          next_credit_seq: number | null
          next_invoice_seq: number | null
          next_proforma_seq: number | null
          next_quote_seq: number | null
          overdue_reminder: boolean | null
          payment_note: string | null
          payment_qr_url: string | null
          phone: string | null
          proforma_title: string | null
          quantity_column_label: string | null
          quote_title: string | null
          sac_code: string | null
          signature_scale: number | null
          signature_url: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string | null
          credit_note_title?: string | null
          default_cgst_pct?: number | null
          default_igst_pct?: number | null
          default_note?: string | null
          default_sgst_pct?: number | null
          due_days?: number | null
          email?: string | null
          hsn_code?: string | null
          invoice_prefix?: string | null
          invoice_title?: string | null
          logo_scale?: number | null
          logo_url?: string | null
          next_credit_seq?: number | null
          next_invoice_seq?: number | null
          next_proforma_seq?: number | null
          next_quote_seq?: number | null
          overdue_reminder?: boolean | null
          payment_note?: string | null
          payment_qr_url?: string | null
          phone?: string | null
          proforma_title?: string | null
          quantity_column_label?: string | null
          quote_title?: string | null
          sac_code?: string | null
          signature_scale?: number | null
          signature_url?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string | null
          credit_note_title?: string | null
          default_cgst_pct?: number | null
          default_igst_pct?: number | null
          default_note?: string | null
          default_sgst_pct?: number | null
          due_days?: number | null
          email?: string | null
          hsn_code?: string | null
          invoice_prefix?: string | null
          invoice_title?: string | null
          logo_scale?: number | null
          logo_url?: string | null
          next_credit_seq?: number | null
          next_invoice_seq?: number | null
          next_proforma_seq?: number | null
          next_quote_seq?: number | null
          overdue_reminder?: boolean | null
          payment_note?: string | null
          payment_qr_url?: string | null
          phone?: string | null
          proforma_title?: string | null
          quantity_column_label?: string | null
          quote_title?: string | null
          sac_code?: string | null
          signature_scale?: number | null
          signature_url?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_document_types: {
        Row: {
          code_prefix: string
          company_id: string
          created_at: string
          id: string
          name: string
          next_sequence: number
          updated_at: string
        }
        Insert: {
          code_prefix: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          next_sequence?: number
          updated_at?: string
        }
        Update: {
          code_prefix?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          next_sequence?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          amount: number
          cgst: number
          created_at: string | null
          description: string
          discount_amount: number | null
          id: string
          invoice_id: string
          item_id: string | null
          note: string | null
          qty: number
          sgst: number
          unit_price: number
        }
        Insert: {
          amount: number
          cgst?: number
          created_at?: string | null
          description: string
          discount_amount?: number | null
          id?: string
          invoice_id: string
          item_id?: string | null
          note?: string | null
          qty?: number
          sgst?: number
          unit_price: number
        }
        Update: {
          amount?: number
          cgst?: number
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          id?: string
          invoice_id?: string
          item_id?: string | null
          note?: string | null
          qty?: number
          sgst?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cgst: number | null
          cgst_pct: number | null
          client_id: string
          company_id: string
          created_at: string | null
          document_type: string
          document_type_id: string | null
          due_date: string | null
          id: string
          igst: number | null
          igst_pct: number | null
          invoice_code: string | null
          issue_date: string
          notes: string | null
          number: string
          paid_amount: number
          pdf_url: string | null
          require_client_signature: boolean | null
          sgst: number | null
          sgst_pct: number | null
          show_my_signature: boolean | null
          status: string | null
          subtotal: number
          total: number
          use_igst: boolean | null
        }
        Insert: {
          cgst?: number | null
          cgst_pct?: number | null
          client_id: string
          company_id: string
          created_at?: string | null
          document_type?: string
          document_type_id?: string | null
          due_date?: string | null
          id?: string
          igst?: number | null
          igst_pct?: number | null
          invoice_code?: string | null
          issue_date: string
          notes?: string | null
          number: string
          paid_amount?: number
          pdf_url?: string | null
          require_client_signature?: boolean | null
          sgst?: number | null
          sgst_pct?: number | null
          show_my_signature?: boolean | null
          status?: string | null
          subtotal?: number
          total?: number
          use_igst?: boolean | null
        }
        Update: {
          cgst?: number | null
          cgst_pct?: number | null
          client_id?: string
          company_id?: string
          created_at?: string | null
          document_type?: string
          document_type_id?: string | null
          due_date?: string | null
          id?: string
          igst?: number | null
          igst_pct?: number | null
          invoice_code?: string | null
          issue_date?: string
          notes?: string | null
          number?: string
          paid_amount?: number
          pdf_url?: string | null
          require_client_signature?: boolean | null
          sgst?: number | null
          sgst_pct?: number | null
          show_my_signature?: boolean | null
          status?: string | null
          subtotal?: number
          total?: number
          use_igst?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "custom_document_types"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          code: string | null
          company_id: string
          created_at: string | null
          default_cgst: number | null
          default_price: number | null
          default_sgst: number | null
          id: string
          name: string
          photo_url: string | null
        }
        Insert: {
          code?: string | null
          company_id: string
          created_at?: string | null
          default_cgst?: number | null
          default_price?: number | null
          default_sgst?: number | null
          id?: string
          name: string
          photo_url?: string | null
        }
        Update: {
          code?: string | null
          company_id?: string
          created_at?: string | null
          default_cgst?: number | null
          default_price?: number | null
          default_sgst?: number | null
          id?: string
          name?: string
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      old_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          qty: number
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          qty?: number
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          currency_code: string | null
          date_format: string | null
          language_code: string | null
          passcode_enabled: boolean | null
          send_me_copy: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code?: string | null
          date_format?: string | null
          language_code?: string | null
          passcode_enabled?: boolean | null
          send_me_copy?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: string | null
          date_format?: string | null
          language_code?: string | null
          passcode_enabled?: boolean | null
          send_me_copy?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_script_chunks: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          chunk_id: string
          movie_title: string
          genre: string
          chunk_text: string
          similarity: number
        }[]
      }
      next_doc_number: {
        Args:
          | { p_company_id: string; p_doc_type: string }
          | {
              p_company_id: string
              p_doc_type: string
              p_custom_type_id?: string
            }
        Returns: string
      }
      next_invoice_number: {
        Args: { p_company_id: string }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
