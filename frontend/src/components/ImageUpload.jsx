import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, ImagePlus, Upload } from "lucide-react";
import Spinner from "./Spinner";
import CameraCapture from "./CameraCapture";
import Avatar from "./Avatar";
import { uploadImage } from "../lib/upload";

// Pengunggah gambar: pilih file ATAU ambil foto langsung dari kamera, unggah ke
// Supabase Storage, kembalikan URL. variant "avatar" (bulat) atau "box" (kotak).
const ImageUpload = ({ value, onChange, folder = "misc", variant = "box", hint, facing = "user", name = "" }) => {
  const [busy, setBusy] = useState(false);
  const [cam, setCam] = useState(false);
  const fileRef = useRef(null);

  const doUpload = async (file) => {
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success("Gambar terunggah");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) doUpload(file);
  };

  const hiddenInput = (
    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
  );
  const camera = (
    <CameraCapture
      open={cam}
      facing={facing}
      onClose={() => setCam(false)}
      onCapture={async (file) => {
        setCam(false);
        await doUpload(file);
      }}
    />
  );

  if (variant === "avatar") {
    return (
      <div className="relative w-fit">
        {hiddenInput}
        <Avatar
          src={value}
          name={name}
          className={`h-28 w-28 ring-4 ring-limesoft ${busy ? "opacity-60" : ""}`}
          textClass="text-3xl"
        />
        <button
          type="button"
          onClick={() => setCam(true)}
          disabled={busy}
          aria-label="Ambil foto"
          className="ring-focus absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-forest text-white hover:bg-ink"
        >
          {busy ? <Spinner /> : <Camera className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Pilih dari galeri"
          className="ring-focus absolute -bottom-1 left-0 grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-forest hover:bg-paper"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
        </button>
        {camera}
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-line bg-paper p-4">
      {hiddenInput}
      <div className="flex flex-col items-center gap-2 text-center">
        {busy ? (
          <Spinner className="h-8 w-8 text-forest" />
        ) : value ? (
          <img src={value} alt="" className="h-28 w-28 rounded-xl object-cover" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-limesoft text-forest">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCam(true)}
            disabled={busy}
            className="ring-focus inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Ambil Foto
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="ring-focus inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-cloud disabled:opacity-60"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Pilih Gambar
          </button>
        </div>
        {hint && <span className="text-xs text-moss">{hint}</span>}
      </div>
      {camera}
    </div>
  );
};

export default ImageUpload;
