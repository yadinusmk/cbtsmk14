
import React from 'react';
import { HasilUjian } from '../../types';
import { useAppContext } from '../../App';

interface ResultScreenProps {
  result: HasilUjian;
  onBackToDashboard: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onBackToDashboard }) => {
  const { schedules, subjects, showScores } = useAppContext();
  const schedule = schedules.find(s => s.id === result.jadwalId);
  const subject = subjects.find(s => s.id === schedule?.mapelId);

  const { benar = 0, totalSoalPg = 0 } = result.detailNilai || {};
  const hasDetails = result.detailNilai !== undefined && totalSoalPg > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Ujian Selesai!</h1>
        <p className="text-gray-600 mt-2">
            Jawaban Anda untuk ujian <span className="font-semibold">{schedule?.nama}</span> telah berhasil disimpan.
        </p>

        {showScores ? (
            <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-sm text-blue-800">Nilai Anda</p>
                <p className="text-6xl font-extrabold text-blue-600 my-2">
                    {result.nilai.toFixed(2)}
                </p>
                <div className="flex justify-center space-x-6 text-gray-700">
                    <div>
                        <p className="text-sm">Mata Pelajaran</p>
                        <p className="font-semibold">{subject?.nama}</p>
                    </div>
                    {hasDetails && (
                    <div>
                        <p className="text-sm">Benar (Pilihan Ganda)</p>
                        <p className="font-semibold">{benar} / {totalSoalPg}</p>
                    </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700">Pengumuman nilai akan diinformasikan lebih lanjut oleh administrator.</p>
            </div>
        )}

        <button
          onClick={onBackToDashboard}
          className="mt-8 w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
