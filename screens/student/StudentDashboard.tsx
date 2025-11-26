
import React, { useMemo } from 'react';
import { User, JadwalUjian } from '../../types';
import { useAppContext } from '../../App';
import LogoutIcon from '../../components/icons/LogoutIcon';

interface StudentDashboardProps {
  user: User;
  onStartExam: (exam: JadwalUjian) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onStartExam, onLogout }) => {
    const { students, schedules, subjects, classes, results, showScores } = useAppContext();

    const currentUserData = useMemo(() => students.find(s => s.id === user.id), [students, user.id]);
    
    const studentResults = useMemo(() => results.filter(r => r.siswaId === user.id), [results, user.id]);

    const availableExams = useMemo(() => {
        if (!currentUserData) return [];
        const now = new Date();
        return schedules.filter(s => {
            if (s.kelasId !== currentUserData.kelasId) return false;
            
            // Check if student has already taken this exam
            if(studentResults.some(r => r.jadwalId === s.id)) return false;

            const [year, month, day] = s.tanggal.split('-').map(Number);
            const [startHour, startMin] = s.jamMulai.split(':').map(Number);
            const [endHour, endMin] = s.jamSelesai.split(':').map(Number);
            
            const startTime = new Date(year, month - 1, day, startHour, startMin);
            const endTime = new Date(year, month - 1, day, endHour, endMin);
            
            return now >= startTime && now <= endTime;
        });
    }, [schedules, currentUserData, studentResults]);

    const getExamDetails = (exam: JadwalUjian) => {
        const subject = subjects.find(s => s.id === exam.mapelId);
        return {
            subjectName: subject?.nama || 'N/A'
        };
    };
    
    const getResultDetails = (result: (typeof results)[0]) => {
        const schedule = schedules.find(s => s.id === result.jadwalId);
        const subject = subjects.find(s => s.id === schedule?.mapelId);
        return {
            examName: schedule?.nama || 'Ujian Dihapus',
            subjectName: subject?.nama || 'Mapel Dihapus',
        };
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {user.nama}</h1>
                    <p className="text-gray-600">
                        Kelas: {classes.find(c => c.id === currentUserData?.kelasId)?.nama || 'N/A'}
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                >
                    <LogoutIcon className="w-5 h-5 mr-2" />
                    Logout
                </button>
            </header>

            <main>
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ujian Tersedia</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableExams.length > 0 ? availableExams.map(exam => {
                            const { subjectName } = getExamDetails(exam);
                            return (
                                <div key={exam.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{exam.nama}</h3>
                                        <p className="text-indigo-600 font-semibold">{subjectName}</p>
                                        <div className="text-sm text-gray-500 mt-2">
                                            <p>Durasi: {exam.durasi} menit</p>
                                            <p>Jumlah Soal: {exam.jumlahSoal}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onStartExam(exam)}
                                        className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Mulai Ujian
                                    </button>
                                </div>
                            );
                        }) : <p className="text-gray-500 col-span-full">Tidak ada ujian yang tersedia saat ini.</p>}
                    </div>
                </section>
                
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Riwayat Ujian</h2>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <ul className="divide-y divide-gray-200">
                           {studentResults.length > 0 ? studentResults.map(result => {
                                const { examName, subjectName } = getResultDetails(result);
                                return (
                                   <li key={result.id} className="flex justify-between items-center py-4">
                                       <div>
                                           <p className="font-semibold text-gray-800">{examName}</p>
                                           <p className="text-sm text-gray-500">{subjectName}</p>
                                       </div>
                                       <div className="text-right">
                                           {showScores ? (
                                                <p className="text-lg font-bold text-blue-600">
                                                   Nilai: {result.nilai.toFixed(2)}
                                               </p>
                                           ) : (
                                                <p className="text-lg font-semibold text-gray-700 px-3 py-1 bg-gray-200 rounded-full">
                                                   Selesai
                                               </p>
                                           )}
                                           <p className="text-xs text-gray-400 mt-1">
                                               {new Date(result.selesaiPada).toLocaleString()}
                                           </p>
                                       </div>
                                   </li>
                                );
                           }) : <p className="text-gray-500 text-center py-4">Anda belum menyelesaikan ujian apapun.</p>}
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default StudentDashboard;
