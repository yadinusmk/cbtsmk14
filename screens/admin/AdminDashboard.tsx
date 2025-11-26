
import React from 'react';
import { useAppContext } from '../../App';
import UsersIcon from '../../components/icons/UsersIcon';
import ClassIcon from '../../components/icons/ClassIcon';
import BookIcon from '../../components/icons/BookIcon';
import ResultIcon from '../../components/icons/ResultIcon';
import SettingsIcon from '../../components/icons/SettingsIcon';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: number | string, color: string }> = ({ icon: Icon, title, value, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center">
            <div className={`p-4 rounded-full ${color}`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
                <p className="text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => {
    return (
        <label className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors">
            <span className="text-gray-700">{label}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
                <div className={`block w-14 h-8 rounded-full transition ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${checked ? 'translate-x-6' : ''}`}></div>
            </div>
        </label>
    );
};


const AdminDashboard = () => {
    const { students, classes, subjects, results, showScores, setShowScores, shuffleQuestions, setShuffleQuestions } = useAppContext();

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={UsersIcon} title="Total Siswa" value={students.length} color="bg-blue-500" />
                <StatCard icon={ClassIcon} title="Total Kelas" value={classes.length} color="bg-green-500" />
                <StatCard icon={BookIcon} title="Mata Pelajaran" value={subjects.length} color="bg-yellow-500" />
                <StatCard icon={ResultIcon} title="Ujian Selesai" value={results.length} color="bg-purple-500" />
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Selamat Datang di Panel Admin</h3>
                <p className="text-gray-600">
                    Gunakan menu navigasi di sebelah kiri untuk mengelola data aplikasi. Anda dapat menambah, mengubah, dan menghapus data siswa, kelas, mata pelajaran, soal, serta menjadwalkan dan melihat hasil ujian.
                </p>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <SettingsIcon className="h-6 w-6 text-gray-700 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Pengaturan</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    <div>
                        <ToggleSwitch 
                            checked={showScores}
                            onChange={() => setShowScores(prev => !prev)}
                            label="Tampilkan Nilai Ujian ke Siswa"
                        />
                         <p className="text-sm text-gray-500 mt-1 pb-3 pl-2">
                            Jika nonaktif, siswa hanya akan melihat status "Selesai" tanpa nilai.
                        </p>
                    </div>
                     <div className="pt-3">
                        <ToggleSwitch 
                            checked={shuffleQuestions}
                            onChange={() => setShuffleQuestions(prev => !prev)}
                            label="Acak Soal Ujian"
                        />
                         <p className="text-sm text-gray-500 mt-1 pl-2">
                            Jika aktif, urutan soal akan diacak untuk setiap siswa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
