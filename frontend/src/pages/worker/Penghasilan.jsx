import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  CalendarRange,
  TrendingUp,
  Landmark,
  Receipt,
} from "lucide-react";
import { api } from "../../lib/api";
import Spinner from "../../components/Spinner";
import { DashboardSkeleton } from "../../components/Skeletons";
import Modal from "../../components/Modal";

const rupiah = (rb) => "Rp" + (Number(rb || 0) * 1000).toLocaleString("id-ID");
const tgl = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const StatTile = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-line bg-white p-4">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-limesoft text-forest">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <p className="mt-3 text-xl font-extrabold text-ink">{value}</p>
    <p className="text-sm text-moss">{label}</p>
  </div>
);

const Penghasilan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const load = () => api.get("/worker/me/earnings").then((r) => setData(r.data.data));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }

  const d = data || {};
  const accounts = d.payoutAccounts || [];
  const transactions = d.transactions || [];

  const doWithdraw = async (body) => {
    await api.post("/worker/me/withdrawals", body);
    await load();
    toast.success("Penarikan berhasil diproses");
    setModal(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Penghasilan</h1>
        <p className="mt-1 text-sm text-moss">Saldo, riwayat transaksi, dan penarikan dana.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="bg-brand relative overflow-hidden rounded-2xl p-5 text-white lg:col-span-2">
          <p className="text-sm text-white/80">Saldo aktif</p>
          <p className="mt-1 text-3xl font-extrabold">{rupiah(d.balance)}</p>
          <button
            type="button"
            onClick={() => setModal(true)}
            disabled={!d.balance}
            className="ring-focus mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-forest transition-colors hover:bg-paper disabled:opacity-60"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            Tarik saldo
          </button>
        </div>
        <StatTile icon={TrendingUp} label="Pendapatan total" value={rupiah(d.totalEarned)} />
        <StatTile icon={CalendarRange} label="Bulan ini" value={rupiah(d.thisMonth)} />
      </section>

      {/* Metode pencairan */}
      <section className="mt-5 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-extrabold text-ink">
            <Landmark className="h-5 w-5 text-forest" aria-hidden="true" />
            Metode Pencairan
          </h2>
          <Link to="/mitra/profil" className="text-sm font-semibold text-forest hover:text-ink">
            Kelola
          </Link>
        </div>
        {accounts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {accounts.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm"
              >
                <span className="font-bold text-ink">{a.provider}</span>
                <span className="text-moss">
                  &bull;&bull;&bull;{a.accountNumber.slice(-4)}
                </span>
                {a.isPrimary && (
                  <span className="rounded-md bg-limesoft px-1.5 py-0.5 text-[11px] font-bold text-forest">
                    Utama
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-moss">
            Belum ada rekening/e-wallet. Tambahkan di halaman Profil dulu.
          </p>
        )}
      </section>

      {/* Riwayat transaksi */}
      <section className="mt-5">
        <h2 className="mb-2 font-extrabold text-ink">Riwayat Transaksi</h2>
        {transactions.length > 0 ? (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {transactions.map((t) => {
              const credit = t.type === "credit";
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full ${
                      credit ? "bg-limesoft text-forest" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {credit ? (
                      <ArrowDownLeft className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{t.title}</p>
                    <p className="text-xs text-moss">
                      {t.sub ? `${t.sub} · ` : ""}
                      {tgl(t.date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-extrabold ${credit ? "text-forest" : "text-red-600"}`}
                  >
                    {credit ? "+" : "-"}
                    {rupiah(t.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white py-14 text-center">
            <Receipt className="h-8 w-8 text-moss" aria-hidden="true" />
            <p className="mt-2 text-sm text-moss">Belum ada transaksi.</p>
          </div>
        )}
      </section>

      <Modal open={modal} title="Tarik Saldo" onClose={() => setModal(false)}>
        <WithdrawForm balance={d.balance} accounts={accounts} onDone={doWithdraw} />
      </Modal>
    </div>
  );
};

const WithdrawForm = ({ balance, accounts, onDone }) => {
  const [amount, setAmount] = useState(Number(balance || 0) * 1000);
  const [acc, setAcc] = useState(accounts.find((a) => a.isPrimary)?.id || accounts[0]?.id || "");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const ribu = Math.floor(Number(amount) / 1000);
    if (ribu < 1) {
      toast.error("Jumlah tidak valid");
      return;
    }
    if (ribu > Number(balance)) {
      toast.error("Melebihi saldo");
      return;
    }
    setBusy(true);
    try {
      await onDone({ amount: ribu, payoutAccountId: acc || undefined });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal menarik saldo");
    } finally {
      setBusy(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-moss">
          Kamu belum menambahkan rekening atau e-wallet tujuan pencairan.
        </p>
        <Link
          to="/mitra/profil"
          className="mt-4 inline-flex rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white hover:bg-ink"
        >
          Tambah di Profil
        </Link>
      </div>
    );
  }

  const inputCls =
    "ring-focus h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="rounded-xl bg-limesoft/50 px-3 py-2 text-sm text-forest">
        Saldo tersedia: <span className="font-bold">{rupiah(balance)}</span>
      </p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Jumlah penarikan (Rp)</span>
        <input
          type="number"
          step="1000"
          min="1000"
          className={inputCls}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Tujuan</span>
        <select className={inputCls} value={acc} onChange={(e) => setAcc(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.provider} ···{a.accountNumber.slice(-4)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
      >
        {busy && <Spinner />}
        {busy ? "Memproses..." : "Tarik Sekarang"}
      </button>
    </form>
  );
};

export default Penghasilan;
