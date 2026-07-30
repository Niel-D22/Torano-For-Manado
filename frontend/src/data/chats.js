// Data dummy percakapan untuk prototipe chat Torano.
// Tipe pesan: "text" | "offer" | "payment" | "location" | "system"

import { workers } from "./workers";

// Daftar percakapan untuk halaman History (inbox).
export const conversations = [
  {
    workerId: 1,
    last: "Baik, saya datang Sabtu jam 9 pagi ya.",
    time: "10:24",
    unread: 2,
  },
  {
    workerId: 4,
    last: "Menu untuk besok sudah saya catat, Bu.",
    time: "Kemarin",
    unread: 0,
  },
  {
    workerId: 3,
    last: "Motornya sudah beres, bisa diambil.",
    time: "Kemarin",
    unread: 0,
  },
  {
    workerId: 9,
    last: "Untuk 50 tamu, saya kirim penawaran ya.",
    time: "Sen",
    unread: 0,
  },
];

let seq = 100;
const uid = () => ++seq;

// Seed pesan untuk sebuah ruang chat. Worker 1 punya alur lengkap (nego + lokasi).
export const getSeedMessages = (workerId) => {
  const base = [
    {
      id: uid(),
      from: "them",
      type: "text",
      text: "Halo, ada yang bisa saya bantu? 🙏",
      time: "09:58",
    },
    {
      id: uid(),
      from: "me",
      type: "text",
      text: "Halo pak, saya butuh perbaikan tembok dapur yang retak. Bisa hari Sabtu?",
      time: "10:01",
    },
    {
      id: uid(),
      from: "them",
      type: "text",
      text: "Bisa. Untuk tembok retak biasanya setengah hari selesai. Lokasinya di mana ya?",
      time: "10:03",
    },
    {
      id: uid(),
      from: "me",
      type: "location",
      title: "Lokasi rumah saya",
      address: "Jl. Sam Ratulangi No. 45, Wanea, Manado",
      lat: 1.4779,
      lng: 124.8412,
      time: "10:04",
    },
    {
      id: uid(),
      from: "them",
      type: "text",
      text: "Oke, dekat dari saya. Ini saya kirim penawaran harganya ya.",
      time: "10:06",
    },
    {
      id: uid(),
      from: "them",
      type: "offer",
      amount: 135,
      status: "pending",
      history: ["Diminta Rp150rb", "Ditawar Rp120rb", "Ditawar balik Rp135rb"],
      time: "10:06",
    },
  ];
  if (workerId === 1) return base;
  // Percakapan generik untuk pekerja lain.
  return [
    {
      id: uid(),
      from: "them",
      type: "text",
      text: "Halo, terima kasih sudah menghubungi. Ada yang bisa dibantu? 🙏",
      time: "08:30",
    },
  ];
};

export const paymentMethods = [
  { id: "gopay", label: "GoPay", hint: "e-wallet" },
  { id: "qris", label: "QRIS", hint: "semua bank & e-wallet" },
  { id: "shopeepay", label: "ShopeePay", hint: "e-wallet" },
  { id: "dana", label: "DANA", hint: "e-wallet" },
  { id: "bca_va", label: "BCA Virtual Account", hint: "transfer bank" },
  { id: "mandiri_va", label: "Mandiri Virtual Account", hint: "transfer bank" },
];

export const getChatWorker = (id) =>
  workers.find((w) => w.id === Number(id)) || workers[0];
