
import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { JadwalUjian } from '../../types';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';

const JadwalUjian = () => {
    const { schedules, subjects, classes, questions, addSchedule, deleteSchedule } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState<Omit<JadwalUjian, 'id'>>({
        nama: '', mapelId: '', kelasId: '', tanggal: '', jamMulai: '', jamSelesai: '', jumlahSoal: 10, durasi: 60,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setNewSchedule(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value,
        }));
    };

    const handleAddSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        const availableQuestions = questions.filter(q => q.mapelId === newSchedule.mapelId).length;
        if (newSchedule.jumlahSoal > availableQuestions) {
            alert(`Jumlah soal yang tersedia untuk mata pelajaran ini hanya ${availableQuestions}. Harap kurangi jumlah soal.`);
            return;
        }
        addSchedule(newSchedule);
        setNewSchedule({
            nama: '', mapelId: '', kelasId: '', tanggal: '', jamMulai: '', jamSelesai: '', jumlahSoal: 10, durasi: 60,
        });
        setIsModalOpen(false);
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Jadwal Ujian</h3>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Buat Jadwal
                </button>
            </div>

             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Ujian</th>
                            <th scope="col" className="px-6 py-3">Mapel</th>
                            <th scope="col" className="px-6 py-3">Kelas</th>
                            <th scope="col" className="px-6 py-3">Waktu</th>
                            <th scope="col" className="px-6 py-3">Durasi</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(s => (
                            <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{s.nama}</td>
                                <td className="px-6 py-4">{subjects.find(sub => sub.id === s.mapelId)?.nama}</td>
                                <td className="px-6 py-4">{classes.find(c => c.id === s.kelasId)?.nama}</td>
                                <td className="px-6 py-4">{s.tanggal} ({s.jamMulai} - {s.jamSelesai})</td>
                                <td className="px-6 py-4">{s.durasi} menit</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => deleteSchedule(s.id)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h4 className="text-lg font-bold mb-4">Buat Jadwal Ujian Baru</h4>
                        <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nama Ujian</label>
                                <input type="text" name="nama" value={newSchedule.nama} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                                <select name="mapelId" value={newSchedule.mapelId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                    <option value="">Pilih Mapel</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Kelas Target</label>
                                <select name="kelasId" value={newSchedule.kelasId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                    <option value="">Pilih Kelas</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" name="tanggal" value={newSchedule.tanggal} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jam Mulai</label>
                                <input type="time" name="jamMulai" value={newSchedule.jamMulai} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Jam Selesai</label>
                                <input type="time" name="jamSelesai" value={newSchedule.jamSelesai} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Soal</label>
                                <input type="number" name="jumlahSoal" value={newSchedule.jumlahSoal} onChange={handleInputChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Durasi (Menit)</label>
                                <input type="number" name="durasi" value={newSchedule.durasi} onChange={handleInputChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            </div>
                            <div className="md:col-span-2 flex items-center justify-end pt-4">
                                <button onClick={() => setIsModalOpen(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600">Batal</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JadwalUjian;
