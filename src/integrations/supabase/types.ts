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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adjustment_lines: {
        Row: {
          adjustment_id: string
          created_at: string
          difference: number
          id: string
          location_id: string
          physical_quantity: number
          product_id: string
          system_quantity: number
        }
        Insert: {
          adjustment_id: string
          created_at?: string
          difference: number
          id?: string
          location_id: string
          physical_quantity: number
          product_id: string
          system_quantity: number
        }
        Update: {
          adjustment_id?: string
          created_at?: string
          difference?: number
          id?: string
          location_id?: string
          physical_quantity?: number
          product_id?: string
          system_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "adjustment_lines_adjustment_id_fkey"
            columns: ["adjustment_id"]
            isOneToOne: false
            referencedRelation: "adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustment_lines_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adjustment_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      adjustments: {
        Row: {
          adjustment_number: string
          created_at: string
          created_by: string
          id: string
          notes: string | null
          reason: string
          status: Database["public"]["Enums"]["document_status"]
          validated_at: string | null
          validated_by: string | null
          warehouse_id: string
        }
        Insert: {
          adjustment_number: string
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          reason: string
          status?: Database["public"]["Enums"]["document_status"]
          validated_at?: string | null
          validated_by?: string | null
          warehouse_id: string
        }
        Update: {
          adjustment_number?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          reason?: string
          status?: Database["public"]["Enums"]["document_status"]
          validated_at?: string | null
          validated_by?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adjustments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          created_at: string
          created_by: string
          customer_name: string
          delivery_number: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["document_status"]
          validated_at: string | null
          validated_by: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_name: string
          delivery_number: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          validated_at?: string | null
          validated_by?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_name?: string
          delivery_number?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          validated_at?: string | null
          validated_by?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_lines: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          location_id: string
          product_id: string
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          location_id: string
          product_id: string
          quantity: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_lines_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_lines_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          aisle: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          rack: string | null
          shelf: string | null
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          aisle?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rack?: string | null
          shelf?: string | null
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          aisle?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rack?: string | null
          shelf?: string | null
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          reorder_level: number
          sku: string
          unit_cost: number | null
          uom: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          reorder_level?: number
          sku: string
          unit_cost?: number | null
          uom?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reorder_level?: number
          sku?: string
          unit_cost?: number | null
          uom?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      receipt_lines: {
        Row: {
          created_at: string
          id: string
          location_id: string
          product_id: string
          quantity: number
          receipt_id: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          product_id: string
          quantity: number
          receipt_id: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number
          receipt_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_lines_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_lines_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          receipt_number: string
          status: Database["public"]["Enums"]["document_status"]
          supplier_name: string
          validated_at: string | null
          validated_by: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          receipt_number: string
          status?: Database["public"]["Enums"]["document_status"]
          supplier_name: string
          validated_at?: string | null
          validated_by?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          receipt_number?: string
          status?: Database["public"]["Enums"]["document_status"]
          supplier_name?: string
          validated_at?: string | null
          validated_by?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_ledger: {
        Row: {
          created_at: string
          created_by: string
          from_location_id: string | null
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          product_id: string
          quantity: number
          reference_doc_id: string
          reference_doc_number: string
          reference_doc_type: string
          to_location_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          from_location_id?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          product_id: string
          quantity: number
          reference_doc_id: string
          reference_doc_number: string
          reference_doc_type: string
          to_location_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          from_location_id?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          product_id?: string
          quantity?: number
          reference_doc_id?: string
          reference_doc_number?: string
          reference_doc_type?: string
          to_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_ledger_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          id: string
          location_id: string
          product_id: string
          quantity: number
          reserved_quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          product_id: string
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_lines: {
        Row: {
          created_at: string
          from_location_id: string
          id: string
          product_id: string
          quantity: number
          to_location_id: string
          transfer_id: string
        }
        Insert: {
          created_at?: string
          from_location_id: string
          id?: string
          product_id: string
          quantity: number
          to_location_id: string
          transfer_id: string
        }
        Update: {
          created_at?: string
          from_location_id?: string
          id?: string
          product_id?: string
          quantity?: number
          to_location_id?: string
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_lines_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_lines_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_lines_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string
          created_by: string
          from_warehouse_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["document_status"]
          to_warehouse_id: string
          transfer_number: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          from_warehouse_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          to_warehouse_id: string
          transfer_number: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          from_warehouse_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          to_warehouse_id?: string
          transfer_number?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
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
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      validate_adjustment: {
        Args: { adjustment_id_param: string; validator_id: string }
        Returns: undefined
      }
      validate_delivery: {
        Args: { delivery_id_param: string; validator_id: string }
        Returns: undefined
      }
      validate_receipt: {
        Args: { receipt_id_param: string; validator_id: string }
        Returns: undefined
      }
      validate_transfer: {
        Args: { transfer_id_param: string; validator_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff"
      document_status: "draft" | "waiting" | "ready" | "done" | "cancelled"
      stock_movement_type: "receipt" | "delivery" | "transfer" | "adjustment"
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
    Enums: {
      app_role: ["admin", "manager", "staff"],
      document_status: ["draft", "waiting", "ready", "done", "cancelled"],
      stock_movement_type: ["receipt", "delivery", "transfer", "adjustment"],
    },
  },
} as const
