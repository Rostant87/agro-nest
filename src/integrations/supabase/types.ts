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
      clients: {
        Row: {
          adresse: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          nom: string
          notes: string | null
          telephone: string | null
          type_client: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          telephone?: string | null
          type_client?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          telephone?: string | null
          type_client?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          beneficiaire: string | null
          categorie: string
          created_at: string
          created_by: string | null
          date_depense: string
          description: string
          id: string
          mode_paiement: string | null
          montant: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          beneficiaire?: string | null
          categorie: string
          created_at?: string
          created_by?: string | null
          date_depense?: string
          description: string
          id?: string
          mode_paiement?: string | null
          montant?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          beneficiaire?: string | null
          categorie?: string
          created_at?: string
          created_by?: string | null
          date_depense?: string
          description?: string
          id?: string
          mode_paiement?: string | null
          montant?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feed_mill: {
        Row: {
          cout_production: number | null
          created_at: string
          created_by: string | null
          date_fabrication: string
          formule: string
          id: string
          ingredient_principal: string | null
          notes: string | null
          quantite_produite_kg: number | null
          stock_restant_kg: number | null
          updated_at: string
        }
        Insert: {
          cout_production?: number | null
          created_at?: string
          created_by?: string | null
          date_fabrication?: string
          formule: string
          id?: string
          ingredient_principal?: string | null
          notes?: string | null
          quantite_produite_kg?: number | null
          stock_restant_kg?: number | null
          updated_at?: string
        }
        Update: {
          cout_production?: number | null
          created_at?: string
          created_by?: string | null
          date_fabrication?: string
          formule?: string
          id?: string
          ingredient_principal?: string | null
          notes?: string | null
          quantite_produite_kg?: number | null
          stock_restant_kg?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          created_at: string
          created_by: string | null
          date_administration: string | null
          date_peremption: string | null
          espece_cible: string | null
          fournisseur: string | null
          id: string
          nom: string
          notes: string | null
          posologie: string | null
          prix_unitaire: number | null
          stock: number | null
          type_produit: string | null
          unite: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_administration?: string | null
          date_peremption?: string | null
          espece_cible?: string | null
          fournisseur?: string | null
          id?: string
          nom: string
          notes?: string | null
          posologie?: string | null
          prix_unitaire?: number | null
          stock?: number | null
          type_produit?: string | null
          unite?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_administration?: string | null
          date_peremption?: string | null
          espece_cible?: string | null
          fournisseur?: string | null
          id?: string
          nom?: string
          notes?: string | null
          posologie?: string | null
          prix_unitaire?: number | null
          stock?: number | null
          type_produit?: string | null
          unite?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      productions: {
        Row: {
          aliment_consomme_kg: number | null
          bande_lot: string | null
          created_at: string
          created_by: string | null
          date_production: string
          effectif_actuel: number | null
          effectif_debut: number | null
          id: string
          mortalite: number | null
          notes: string | null
          poids_moyen_kg: number | null
          type_elevage: string
          updated_at: string
        }
        Insert: {
          aliment_consomme_kg?: number | null
          bande_lot?: string | null
          created_at?: string
          created_by?: string | null
          date_production?: string
          effectif_actuel?: number | null
          effectif_debut?: number | null
          id?: string
          mortalite?: number | null
          notes?: string | null
          poids_moyen_kg?: number | null
          type_elevage: string
          updated_at?: string
        }
        Update: {
          aliment_consomme_kg?: number | null
          bande_lot?: string | null
          created_at?: string
          created_by?: string | null
          date_production?: string
          effectif_actuel?: number | null
          effectif_debut?: number | null
          id?: string
          mortalite?: number | null
          notes?: string | null
          poids_moyen_kg?: number | null
          type_elevage?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          article: string
          created_at: string
          created_by: string | null
          date_achat: string
          fournisseur: string
          id: string
          mode_paiement: string | null
          montant_total: number
          notes: string | null
          prix_unitaire: number
          quantite: number
          unite: string | null
          updated_at: string
        }
        Insert: {
          article: string
          created_at?: string
          created_by?: string | null
          date_achat?: string
          fournisseur: string
          id?: string
          mode_paiement?: string | null
          montant_total?: number
          notes?: string | null
          prix_unitaire?: number
          quantite?: number
          unite?: string | null
          updated_at?: string
        }
        Update: {
          article?: string
          created_at?: string
          created_by?: string | null
          date_achat?: string
          fournisseur?: string
          id?: string
          mode_paiement?: string | null
          montant_total?: number
          notes?: string | null
          prix_unitaire?: number
          quantite?: number
          unite?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      receptions: {
        Row: {
          cout_total: number | null
          created_at: string
          created_by: string | null
          date_reception: string
          description: string | null
          fournisseur: string | null
          id: string
          notes: string | null
          prix_unitaire: number | null
          quantite: number
          type_animal: string
          unite: string | null
          updated_at: string
        }
        Insert: {
          cout_total?: number | null
          created_at?: string
          created_by?: string | null
          date_reception?: string
          description?: string | null
          fournisseur?: string | null
          id?: string
          notes?: string | null
          prix_unitaire?: number | null
          quantite?: number
          type_animal: string
          unite?: string | null
          updated_at?: string
        }
        Update: {
          cout_total?: number | null
          created_at?: string
          created_by?: string | null
          date_reception?: string
          description?: string | null
          fournisseur?: string | null
          id?: string
          notes?: string | null
          prix_unitaire?: number | null
          quantite?: number
          type_animal?: string
          unite?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          date_vente: string
          id: string
          mode_paiement: string | null
          montant_total: number
          notes: string | null
          prix_unitaire: number
          produit: string
          quantite: number
          statut: string | null
          unite: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          date_vente?: string
          id?: string
          mode_paiement?: string | null
          montant_total?: number
          notes?: string | null
          prix_unitaire?: number
          produit: string
          quantite?: number
          statut?: string | null
          unite?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          date_vente?: string
          id?: string
          mode_paiement?: string | null
          montant_total?: number
          notes?: string | null
          prix_unitaire?: number
          produit?: string
          quantite?: number
          statut?: string | null
          unite?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
          role: Database["public"]["Enums"]["app_role"]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "employee"
      department:
        | "direction"
        | "production_poulet"
        | "production_porc"
        | "production_canard"
        | "provenderie"
        | "reception"
        | "ventes"
        | "achats"
        | "comptabilite"
        | "maintenance"
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
      app_role: ["super_admin", "admin", "employee"],
      department: [
        "direction",
        "production_poulet",
        "production_porc",
        "production_canard",
        "provenderie",
        "reception",
        "ventes",
        "achats",
        "comptabilite",
        "maintenance",
      ],
    },
  },
} as const
