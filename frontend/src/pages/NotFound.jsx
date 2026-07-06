const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">
          Halaman yang Anda cari tidak ditemukan.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
