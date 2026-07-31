// Peta aset foto landing page — SATU tempat untuk mengganti foto.
//
// Foto saat ini adalah placeholder open-content (CC, via LoremFlickr)
// yang sudah diunduh lokal ke src/assets/landing/ agar cepat dan tidak
// bergantung internet saat demo. Saat foto final siap, cukup timpa file
// dengan nama yang sama — tidak ada kode yang perlu disentuh.

import bgHero from "../../assets/BG_HeroLandingPage.png";

// Ilustrasi cat air hero (senada latar), digenerate AI.
import heroArt from "../../assets/landing/Hero/Hero1.png";
import heroTukang from "../../assets/landing/Hero/Hero2.png";
import heroMontir from "../../assets/landing/Hero/Hero3.png";
import catArt from "../../assets/landing/cat-art.jpg";
import catTukang from "../../assets/landing/cat-tukang.jpg";
import catEvent from "../../assets/landing/cat-event.jpg";
import catMontir from "../../assets/landing/cat-montir.jpg";
import testiFeby from "../../assets/landing/testi-feby.jpg";
import testiRicky from "../../assets/landing/testi-ricky.jpg";
import testiJefri from "../../assets/landing/testi-jefri.jpg";
import ctaMitra from "../../assets/landing/cta-mitra.jpg";

export const landingPhotos = {
  // Kolase hero — foto candid pekerja sedang bekerja (potret)
  heroTukang,
  heroArt,
  heroMontir,

  // Kartu kategori (landscape)
  catArt,
  catTukang,
  catEvent,
  catMontir,

  // Foto suasana kerja di bagian atas kartu testimoni
  testiFeby,
  testiRicky,
  testiJefri,

  // Banner CTA mitra — golden hour (landscape lebar)
  ctaMitra,
};

export { bgHero };
