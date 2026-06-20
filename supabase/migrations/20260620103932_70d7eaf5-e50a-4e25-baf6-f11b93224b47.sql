
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE user_count INT;
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
END; $$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage policies for employee-photos bucket
CREATE POLICY "Authenticated can view employee photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'employee-photos');

CREATE POLICY "Users can upload their own photo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'employee-photos'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
  );

CREATE POLICY "Users can update their own photo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'employee-photos'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
  );

CREATE POLICY "Admins can delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'employee-photos' AND public.is_admin(auth.uid()));
