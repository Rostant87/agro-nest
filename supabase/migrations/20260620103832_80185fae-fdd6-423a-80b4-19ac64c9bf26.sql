
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'employee');

CREATE TYPE public.department AS ENUM (
  'direction',
  'production_poulet',
  'production_porc',
  'production_canard',
  'provenderie',
  'reception',
  'ventes',
  'achats',
  'comptabilite',
  'maintenance'
);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  department public.department,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ HAS_ROLE FUNCTION ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','super_admin')
  )
$$;

-- ============ PROFILES POLICIES ============
CREATE POLICY "Anyone authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins insert profiles"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins delete profiles"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============ USER_ROLES POLICIES ============
CREATE POLICY "Authenticated can view roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============ TRIGGER: auto-create profile + bootstrap super_admin ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  );

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ UPDATED_AT helper ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ HELPER MACRO via repeated blocks ============
-- Generic policies factory: admins full access; employees read.

-- ============ RECEPTIONS ============
CREATE TABLE public.receptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_reception TIMESTAMPTZ NOT NULL DEFAULT now(),
  type_animal TEXT NOT NULL,           -- poulet, porc, canard, matiere_premiere
  description TEXT,
  quantite NUMERIC NOT NULL DEFAULT 0,
  unite TEXT DEFAULT 'unite',
  fournisseur TEXT,
  prix_unitaire NUMERIC DEFAULT 0,
  cout_total NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receptions TO authenticated;
GRANT ALL ON public.receptions TO service_role;
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read receptions" ON public.receptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write receptions" ON public.receptions FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update receptions" ON public.receptions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete receptions" ON public.receptions FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_receptions_updated BEFORE UPDATE ON public.receptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ PRODUCTIONS ============
CREATE TABLE public.productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_production TIMESTAMPTZ NOT NULL DEFAULT now(),
  type_elevage TEXT NOT NULL,           -- poulet, porc, canard
  bande_lot TEXT,
  effectif_debut INT DEFAULT 0,
  effectif_actuel INT DEFAULT 0,
  mortalite INT DEFAULT 0,
  poids_moyen_kg NUMERIC DEFAULT 0,
  aliment_consomme_kg NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.productions TO authenticated;
GRANT ALL ON public.productions TO service_role;
ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read productions" ON public.productions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write productions" ON public.productions FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update productions" ON public.productions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete productions" ON public.productions FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_productions_updated BEFORE UPDATE ON public.productions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ FEED MILL (Provenderie) ============
CREATE TABLE public.feed_mill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_fabrication TIMESTAMPTZ NOT NULL DEFAULT now(),
  formule TEXT NOT NULL,                -- demarrage, croissance, finition, ponte
  ingredient_principal TEXT,
  quantite_produite_kg NUMERIC DEFAULT 0,
  cout_production NUMERIC DEFAULT 0,
  stock_restant_kg NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_mill TO authenticated;
GRANT ALL ON public.feed_mill TO service_role;
ALTER TABLE public.feed_mill ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read feed" ON public.feed_mill FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write feed" ON public.feed_mill FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update feed" ON public.feed_mill FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete feed" ON public.feed_mill FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_feed_updated BEFORE UPDATE ON public.feed_mill FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ CLIENTS ============
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  ville TEXT,
  adresse TEXT,
  type_client TEXT,                     -- particulier, grossiste, restaurant
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update clients" ON public.clients FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete clients" ON public.clients FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ SALES ============
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_vente TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  produit TEXT NOT NULL,
  quantite NUMERIC NOT NULL DEFAULT 0,
  unite TEXT DEFAULT 'unite',
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  montant_total NUMERIC NOT NULL DEFAULT 0,
  mode_paiement TEXT,                   -- espece, mobile_money, virement
  statut TEXT DEFAULT 'paye',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update sales" ON public.sales FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete sales" ON public.sales FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_sales_updated BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ PURCHASES ============
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_achat TIMESTAMPTZ NOT NULL DEFAULT now(),
  fournisseur TEXT NOT NULL,
  article TEXT NOT NULL,
  quantite NUMERIC NOT NULL DEFAULT 0,
  unite TEXT DEFAULT 'unite',
  prix_unitaire NUMERIC NOT NULL DEFAULT 0,
  montant_total NUMERIC NOT NULL DEFAULT 0,
  mode_paiement TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update purchases" ON public.purchases FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete purchases" ON public.purchases FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_purchases_updated BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ EXPENSES ============
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_depense TIMESTAMPTZ NOT NULL DEFAULT now(),
  categorie TEXT NOT NULL,              -- salaire, eau, electricite, transport, etc.
  description TEXT NOT NULL,
  montant NUMERIC NOT NULL DEFAULT 0,
  mode_paiement TEXT,
  beneficiaire TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update expenses" ON public.expenses FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete expenses" ON public.expenses FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ MEDICINES ============
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type_produit TEXT,                    -- antibiotique, vaccin, vitamine, antiparasitaire
  espece_cible TEXT,                    -- poulet, porc, canard, tous
  stock NUMERIC DEFAULT 0,
  unite TEXT DEFAULT 'unite',
  posologie TEXT,
  date_peremption DATE,
  date_administration TIMESTAMPTZ,
  fournisseur TEXT,
  prix_unitaire NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicines TO authenticated;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read medicines" ON public.medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write medicines" ON public.medicines FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admin update medicines" ON public.medicines FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin delete medicines" ON public.medicines FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER trg_medicines_updated BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
