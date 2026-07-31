// Sistem skeleton loader.
//
// LOGIKA KAPAN PAKAI APA:
// - Spinner  : aksi kecil di tempat (tombol Simpan/Kirim/Bayar, memuat sub-panel,
//              jeda singkat yang layoutnya belum jelas).
// - Skeleton : memuat DATA AWAL satu halaman yang tata letaknya sudah diketahui
//              (daftar, kartu, tabel, profil, dashboard). Bentuknya meniru
//              struktur konten agar tidak ada lompatan layout dan terasa cepat.

// Blok abu-abu berdenyut (primitif dasar semua skeleton).
export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-line/70 ${className}`} aria-hidden="true" />
);

const Line = ({ w = "w-full" }) => <Skeleton className={`h-3.5 ${w}`} />;

// Bungkus umum: beri label aksesibilitas "memuat".
const Wrap = ({ children, className = "" }) => (
  <div role="status" aria-busy="true" aria-label="Memuat" className={className}>
    {children}
  </div>
);

// ── Kartu pekerja (halaman Cari) ──
export const WorkerCardsSkeleton = ({ count = 6 }) => (
  <Wrap className="grid gap-4 sm:grid-cols-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-3 rounded-2xl border border-line bg-white p-3">
        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-3 h-3 w-2/5" />
        </div>
      </div>
    ))}
  </Wrap>
);

// ── Profil pekerja (halaman /pekerja/:id) ──
export const WorkerProfileSkeleton = () => (
  <Wrap className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex gap-4">
        <Skeleton className="h-24 w-24 rounded-xl" />
        <div className="flex-1 space-y-3 py-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/5" />
        </div>
      </div>
      <Skeleton className="mt-5 h-12 w-full rounded-xl" />
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-3 rounded-2xl border border-line bg-white p-5 lg:col-span-2">
        <Skeleton className="h-4 w-24" />
        <Line />
        <Line w="w-5/6" />
        <Line w="w-4/6" />
      </div>
      <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
        <Skeleton className="h-4 w-28" />
        <Line w="w-3/4" />
        <Line w="w-2/3" />
      </div>
    </div>
  </Wrap>
);

// ── Chat (dua panel) ──
export const ChatSkeleton = () => (
  <Wrap className="mx-auto max-w-7xl sm:px-6 sm:py-6">
    <div className="grid h-[calc(100dvh-4rem)] overflow-hidden bg-white sm:h-[calc(100dvh-7rem)] sm:rounded-2xl sm:border sm:border-line md:grid-cols-[300px_1fr]">
      {/* daftar */}
      <div className="hidden flex-col gap-3 border-r border-line p-4 md:flex">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-full rounded-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      {/* ruang chat */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 space-y-3 bg-paper p-4">
          <Skeleton className="h-10 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
          <Skeleton className="h-16 w-3/5 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl" />
        </div>
        <div className="p-4">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  </Wrap>
);

// ── Kotak statistik (dashboard) ──
export const StatCardsSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 rounded-2xl border border-line bg-white p-5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
);

// ── Dashboard (beranda pekerja / admin) ──
export const DashboardSkeleton = () => (
  <Wrap className="px-4 py-6 sm:px-6 lg:px-8">
    <Skeleton className="h-7 w-52" />
    <Skeleton className="mt-2 h-4 w-64" />
    <div className="mt-5">
      <StatCardsSkeleton />
    </div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-line bg-white p-5">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3 py-1">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </Wrap>
);

// ── Daftar baris (Jadwal, Ulasan, dsb.) ──
export const ListSkeleton = ({ count = 5, title = true }) => (
  <Wrap className="mx-auto max-w-4xl space-y-3 px-4 py-6 sm:px-6 lg:px-8">
    {title && <Skeleton className="h-7 w-40" />}
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </Wrap>
);

// ── Tabel admin ──
export const AdminTableSkeleton = ({ rows = 8 }) => (
  <Wrap className="px-4 py-6 sm:px-6 lg:px-8">
    <Skeleton className="h-7 w-40" />
    <Skeleton className="mt-2 h-4 w-64" />
    <div className="mt-5 rounded-2xl border border-line bg-white p-4 sm:p-5">
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-line/60 pb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </Wrap>
);

export default Skeleton;
