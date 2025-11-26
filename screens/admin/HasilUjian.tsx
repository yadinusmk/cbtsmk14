import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../App';
import ResetIcon from '../../components/icons/ResetIcon';

const HasilUjian = () => {
    const { results, students, schedules, subjects, classes, deleteResult } = useAppContext();
    const [filterSubject, setFilterSubject] = useState('');
    const [filterClass, setFilterClass] = useState('');

    const filteredResults = useMemo(() => {
        return results.filter(result => {
            const schedule = schedules.find(s => s.id === result.jadwalId);
            const student = students.find(s => s.id === result.siswaId);
            if (!schedule || !student) return false;

            const subjectMatch = !filterSubject || schedule.mapelId === filterSubject;
            const classMatch = !filterClass || student.kelasId === filterClass;
            
            return subjectMatch && classMatch;
        });
    }, [results, schedules, students, filterSubject, filterClass]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Hasil Ujian</h3>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
                <select 
                    value={filterSubject} 
                    onChange={e => setFilterSubject(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto p-2.5"
                >
                    <option value="">Semua Mata Pelajaran</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
                <select 
                    value={filterClass} 
                    onChange={e => setFilterClass(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto p-2.5"
                >
                    <option value="">Semua Kelas</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Siswa</th>
                            <th scope="col" className="px-6 py-3">Kelas</th>
                            <th scope="col" className="px-6 py-3">Nama Ujian</th>
                            <th scope="col" className="px-6 py-3">Mata Pelajaran</th>
                            <th scope="col" className="px-6 py-3">Nilai</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResults.map(result => {
                            const student = students.find(s => s.id === result.siswaId);
                            const schedule = schedules.find(s => s.id === result.jadwalId);
                            if (!student || !schedule) return null;
                            const studentClass = classes.find(c => c.id === student.kelasId);
                            const subject = subjects.find(s => s.id === schedule.mapelId);

                            return (
                                <tr key={result.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.nama}</td>
                                    <td className="px-6 py-4">{studentClass?.nama}</td>
                                    <td className="px-6 py-4">{schedule.nama}</td>
                                    <td className="px-6 py-4">{subject?.nama}</td>
                                    <td className="px-6 py-4 font-bold">{result.nilai.toFixed(2)}</td>
                                    <td className="px-6 py-4">{new Date(result.selesaiPada).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Anda yakin ingin mereset hasil ujian untuk ${student.nama}? Siswa ini akan dapat mengerjakan ujian kembali.`)) {
                                                    deleteResult(result.id);
                                                }
                                            }}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition"
                                            title="Reset Ujian"
                                        >
                                            <ResetIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HasilUjian;