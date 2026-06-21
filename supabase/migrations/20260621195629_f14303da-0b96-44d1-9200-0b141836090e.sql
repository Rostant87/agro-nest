
-- PROFILES: restrict SELECT to self + admins
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- CLIENTS: restrict SELECT to admins
DROP POLICY IF EXISTS "Anyone authenticated can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated can view clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can view clients" ON public.clients;

CREATE POLICY "Admins can view clients"
  ON public.clients FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- EXPENSES: restrict SELECT to admins
DROP POLICY IF EXISTS "Anyone authenticated can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can view expenses" ON public.expenses;

CREATE POLICY "Admins can view expenses"
  ON public.expenses FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
