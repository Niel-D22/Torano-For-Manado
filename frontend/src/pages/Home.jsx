const Home = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl rounded-2xl bg-white/80 p-10 shadow-xl backdrop-blur">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
          Bakudapa
        </p>
        <h1 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
          Bakudapa - Frontend Ready
        </h1>
        <p className="text-lg text-slate-600">
          Platform job portal untuk pekerja informal di Manado yang siap
          dikembangkan lebih lanjut.
        </p>
      </div>
    </div>
  );
};

export default Home;
