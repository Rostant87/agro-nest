import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments } from "@/lib/locale";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useCurrentUser();
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setProfile({
        full_name: data.full_name ?? "",
        username: data.username ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        department: data.department ?? "",
      });
      if (data.photo_url) {
        const { data: signed } = await supabase.storage.from("employee-photos").createSignedUrl(data.photo_url, 3600);
        setPhotoUrl(signed?.signedUrl ?? null);
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      username: profile.username || null,
      phone: profile.phone || null,
      address: profile.address || null,
      department: (profile.department || null) as never,
    }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profil mis à jour");
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("employee-photos").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    await supabase.from("profiles").update({ photo_url: path }).eq("id", user.id);
    const { data: signed } = await supabase.storage.from("employee-photos").createSignedUrl(path, 3600);
    setPhotoUrl(signed?.signedUrl ?? null);
    setUploading(false);
    toast.success("Photo mise à jour");
  };

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted overflow-hidden grid place-items-center">
            {photoUrl ? <img src={photoUrl} alt="Profil" className="h-full w-full object-cover" /> : <span className="text-2xl">{profile.full_name?.[0] ?? "?"}</span>}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
            <Button asChild variant="outline" disabled={uploading}><span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Envoi…" : "Changer la photo"}</span></Button>
          </label>
        </div>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Nom complet</Label>
            <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required /></div>
          <div><Label>Nom d'utilisateur</Label>
            <Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
          <div><Label>Email</Label>
            <Input value={profile.email} disabled /></div>
          <div><Label>Téléphone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+237…" /></div>
          <div><Label>Adresse</Label>
            <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Département</Label>
            <Select value={profile.department} onValueChange={(v) => setProfile({ ...profile, department: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Button type="submit">Enregistrer</Button></div>
        </form>
      </Card>
    </div>
  );
}