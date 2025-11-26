
export interface User {
  id: string;
  nis: string;
  nama: string;
  role: 'admin' | 'student';
}

export interface Siswa {
  id: string;
  nis: string;
  nama: string;
  kelasId: string;
  password?: string; // Should be hashed in a real app
}

export interface Kelas {
  id: string;
  nama: string;
}

export interface MataPelajaran {
  id: string;
  nama: string;
}

export interface Soal {
  id: string;
  mapelId: string;
  pertanyaan: string;
  gambar?: string; // Base64 encoded image string
  tipe: 'pilihan_ganda' | 'essay';

  // For pilihan_ganda
  pilihan?: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };

  // For pilihan_ganda, it's 'A', 'B', etc.
  // For essay, it can be the model text answer.
  kunciJawaban: string;
}


export interface JadwalUjian {
  id: string;
  nama: string;
  mapelId: string;
  kelasId: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  jumlahSoal: number;
  durasi: number; // in minutes
}

export interface JawabanSiswa {
    soalId: string;
    jawaban: string | null;
}

export interface HasilUjian {
  id: string;
  siswaId: string;
  jadwalId: string;
  nilai: number;
  jawaban: JawabanSiswa[];
  selesaiPada: string;
  detailNilai?: {
      benar: number;
      totalSoalPg: number;
  }
}