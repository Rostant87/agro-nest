
DROP POLICY IF EXISTS "read clients" ON public.clients;
DROP POLICY IF EXISTS "read expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated read settings" ON public.app_settings;
CREATE POLICY "Admins read settings" ON public.app_settings FOR SELECT USING (is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));
