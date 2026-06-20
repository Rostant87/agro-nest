import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/surveillance")({ component: SurveillancePage });

interface Cam { id: string; name: string; url: string }
const STORAGE_KEY = "sf_cameras_v1";

function SurveillancePage() {
  const [cams, setCams] = useState<Cam[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    try { setCams(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")); } catch { /* noop */ }
  }, []);

  const persist = (next: Cam[]) => {
    setCams(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addCam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return toast.error("Nom et URL requis");
    persist([...cams, { id: crypto.randomUUID(), name, url }]);
    setName(""); setUrl("");
    toast.success("Caméra ajoutée");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Camera className="h-6 w-6" /> Vidéosurveillance</h1>
        <p className="text-sm text-muted-foreground">Connectez vos caméras IP via flux HLS (`.m3u8`). Les flux RTSP doivent d'abord être convertis en HLS via un serveur média (ex. MediaMTX, Wowza).</p>
      </div>
      <Card className="p-4">
        <form onSubmit={addCam} className="grid gap-3 sm:grid-cols-3">
          <div><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Poulailler 1" /></div>
          <div className="sm:col-span-2"><Label>URL HLS (.m3u8)</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/stream.m3u8" /></div>
          <div className="sm:col-span-3"><Button type="submit"><Plus className="h-4 w-4 mr-1" />Ajouter une caméra</Button></div>
        </form>
      </Card>
      {cams.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Aucune caméra configurée pour l'instant.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cams.map((c) => (
            <CameraTile key={c.id} cam={c} onRemove={() => persist(cams.filter((x) => x.id !== c.id))} />
          ))}
        </div>
      )}
    </div>
  );
}

function CameraTile({ cam, onRemove }: { cam: Cam; onRemove: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setErr(null);
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = cam.url;
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(cam.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, d) => { if (d.fatal) setErr("Flux indisponible"); });
      return () => hls.destroy();
    }
    setErr("HLS non supporté");
  }, [cam.url]);

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-black grid place-items-center">
        {err ? <div className="text-destructive text-sm">{err}</div> : <video ref={videoRef} className="w-full h-full" muted autoPlay playsInline controls />}
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="font-medium">{cam.name}</div>
        <Button size="icon" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    </Card>
  );
}