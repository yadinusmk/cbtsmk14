import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../App';
import { Soal } from '../../types';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import ImageIcon from '../../components/icons/ImageIcon';
import FileTextIcon from '../../components/icons/FileTextIcon';
import UploadIcon from '../../components/icons/UploadIcon';


const BankSoal = () => {
    const { questions, subjects, addQuestion, deleteQuestion, setQuestions } = useAppContext();
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // State for single question modal
    const initialNewQuestionState: Omit<Soal, 'id' | 'mapelId'> = {
        pertanyaan: '',
        tipe: 'pilihan_ganda',
        pilihan: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
        kunciJawaban: 'A',
        gambar: undefined,
    };
    const [newQuestion, setNewQuestion] = useState(initialNewQuestionState);

    // State for bulk upload modal
    const [bulkImages, setBulkImages] = useState<FileList | null>(null);
    const [bulkKeysFile, setBulkKeysFile] = useState<File | null>(null);
    const [bulkUploadStatus, setBulkUploadStatus] = useState({ type: '', message: '' });

    const filteredQuestions = useMemo(() => {
        if (!selectedSubject) return [];
        return questions.filter(q => q.mapelId === selectedSubject);
    }, [questions, selectedSubject]);

    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSubject && newQuestion.pertanyaan) {
            let questionToAdd: Omit<Soal, 'id'> = { ...newQuestion, mapelId: selectedSubject };
            if (questionToAdd.tipe === 'pilihan_ganda') {
                questionToAdd.pilihan = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' };
            } else {
                delete questionToAdd.pilihan;
            }
            addQuestion(questionToAdd);

            setNewQuestion(prev => ({
                ...initialNewQuestionState,
                tipe: prev.tipe, // keep the selected type
            }));

            setSuccessMessage('Soal berhasil ditambahkan! Silakan tambah lagi.');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };
    
    const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'tipe') {
            const newType = value as 'pilihan_ganda' | 'essay';
            setNewQuestion(prev => ({
                ...prev,
                tipe: newType,
                pilihan: newType === 'pilihan_ganda' ? { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' } : undefined,
                kunciJawaban: newType === 'pilihan_ganda' ? 'A' : '',
            }));
        } else {
            setNewQuestion(prev => ({ ...prev, [name]: value } as any));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setNewQuestion(prev => ({ ...prev, gambar: reader.result as string })); };
            reader.readAsDataURL(file);
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkImages || !bulkKeysFile || !selectedSubject) {
            setBulkUploadStatus({ type: 'error', message: 'Harap pilih file gambar soal dan file kunci jawaban.' });
            return;
        }

        setBulkUploadStatus({ type: 'info', message: 'Memproses file... Mohon tunggu.' });

        try {
            // 1. Parse Kunci Jawaban
            const keysText = await bulkKeysFile.text();
            const keysMap = new Map<number, string>();
            keysText.split('\n').forEach(line => {
                const match = line.match(/^(\d+)\s*[.:]\s*([A-Ea-e])\s*$/);
                if (match) keysMap.set(parseInt(match[1], 10), match[2].toUpperCase());
            });

            if (keysMap.size === 0) throw new Error("Format file kunci jawaban tidak valid atau kosong.");

            // 2. Parse Gambar
            // FIX: Explicitly type `file` as `File` to resolve type inference issues.
            // The compiler was inferring `file` as `unknown`, causing errors when
            // accessing `file.name` and using it as a Blob.
            const imagePromises = Array.from(bulkImages).map((file: File) => {
                return new Promise<{ number: number; base64: string }>((resolve, reject) => {
                    const numberMatch = file.name.match(/(\d+)/);
                    if (!numberMatch) return reject(`Nama file tidak valid: ${file.name}. Harus mengandung nomor soal.`);
                    
                    const number = parseInt(numberMatch[1], 10);
                    const reader = new FileReader();
                    reader.onload = () => resolve({ number, base64: reader.result as string });
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const imageData = await Promise.all(imagePromises);

            // 3. Match and Create Soal
            const newQuestions: Soal[] = [];
            imageData.forEach(img => {
                if (keysMap.has(img.number)) {
                    newQuestions.push({
                        id: `${Date.now()}-${img.number}-${Math.random()}`,
                        mapelId: selectedSubject,
                        pertanyaan: `Soal nomor ${img.number}. Perhatikan gambar.`,
                        gambar: img.base64,
                        tipe: 'pilihan_ganda',
                        pilihan: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
                        kunciJawaban: keysMap.get(img.number)!,
                    });
                }
            });

            if (newQuestions.length === 0) throw new Error("Tidak ada soal yang berhasil dicocokkan. Periksa penomoran pada nama file dan kunci jawaban.");

            // 4. Save to state
            setQuestions(prev => [...prev, ...newQuestions]);
            setBulkUploadStatus({ type: 'success', message: `Berhasil! ${newQuestions.length} soal telah ditambahkan.` });

        } catch (error: any) {
            setBulkUploadStatus({ type: 'error', message: error.message || 'Terjadi kesalahan saat memproses file.' });
        }
    };

    const openModal = () => {
        setNewQuestion(initialNewQuestionState);
        setSuccessMessage('');
        setIsModalOpen(true);
    };
    
    const openBulkModal = () => {
        setBulkImages(null);
        setBulkKeysFile(null);
        setBulkUploadStatus({ type: '', message: '' });
        setIsBulkModalOpen(true);
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-gray-800">Bank Soal</h3>
                <div className="flex items-center space-x-2">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    >
                        <option value="">Pilih Mata Pelajaran</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                    <button 
                        onClick={openBulkModal}
                        disabled={!selectedSubject}
                        className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition duration-200"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Upload Massal
                    </button>
                    <button 
                        onClick={openModal}
                        disabled={!selectedSubject}
                        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition duration-200"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Soal
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                 {filteredQuestions.map((q, index) => (
                    <div key={q.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                               <p className="font-semibold text-gray-800">{q.pertanyaan}</p>
                               {q.gambar && <img src={q.gambar} alt="Soal" className="mt-2 rounded-md max-w-xs max-h-48" />}
                               <span className="text-xs font-semibold uppercase text-blue-500 mt-2 inline-block">{q.tipe.replace('_', ' ')}</span>
                           </div>
                            <button onClick={() => deleteQuestion(q.id)} className="text-red-500 hover:text-red-700 ml-4">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {q.tipe === 'pilihan_ganda' && q.pilihan && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-2 text-sm">
                                {Object.entries(q.pilihan).map(([key, value]) => (
                                    <p key={key} className={key === q.kunciJawaban ? 'text-green-600 font-bold' : 'text-gray-600'}>
                                        {key}. {value === key ? '' : value}
                                    </p>
                                ))}
                            </div>
                        )}
                        {q.tipe === 'essay' && (
                             <div className="mt-2 text-sm">
                                <p className="font-semibold text-gray-700">Kunci Jawaban:</p>
                                <p className="text-gray-600 bg-gray-50 p-2 rounded-md">{q.kunciJawaban}</p>
                            </div>
                        )}
                    </div>
                ))}
                {selectedSubject && filteredQuestions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Belum ada soal untuk mata pelajaran ini.</p>
                )}
                 {!selectedSubject && (
                    <p className="text-center text-gray-500 py-4">Silakan pilih mata pelajaran untuk melihat atau menambah soal.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h4 className="text-lg font-bold mb-4">Tambah Soal Baru untuk {subjects.find(s=>s.id === selectedSubject)?.nama}</h4>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            {successMessage && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                                    <p>{successMessage}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe Soal</label>
                                <select name="tipe" value={newQuestion.tipe} onChange={handleQuestionInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                    <option value="pilihan_ganda">Pilihan Ganda</option>
                                    <option value="essay">Essay</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pertanyaan</label>
                                <textarea name="pertanyaan" value={newQuestion.pertanyaan} onChange={handleQuestionInputChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar (Opsional)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                {newQuestion.gambar && (
                                    <div className="mt-2 relative">
                                        <img src={newQuestion.gambar} alt="Preview" className="rounded-md max-w-xs max-h-48" />
                                        <button type="button" onClick={() => setNewQuestion(p => ({...p, gambar: undefined}))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none">&times;</button>
                                    </div>
                                )}
                            </div>

                            {newQuestion.tipe === 'pilihan_ganda' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kunci Jawaban</label>
                                    <div className="flex items-center space-x-6 mt-2">
                                        {['A', 'B', 'C', 'D', 'E'].map(opt => (
                                            <div key={opt} className="flex items-center">
                                                <input
                                                    id={`kunci_${opt}`}
                                                    type="radio"
                                                    name="kunciJawaban"
                                                    value={opt}
                                                    checked={newQuestion.kunciJawaban === opt}
                                                    onChange={handleQuestionInputChange}
                                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <label htmlFor={`kunci_${opt}`} className="ml-2 font-semibold text-gray-700">{opt}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kunci Jawaban (Essay)</label>
                                    <textarea name="kunciJawaban" value={newQuestion.kunciJawaban} onChange={handleQuestionInputChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                                </div>
                            )}

                            <div className="flex items-center justify-end pt-4">
                                <button onClick={() => setIsModalOpen(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600">Tutup</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Simpan & Tambah Lagi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isBulkModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                         <h4 className="text-lg font-bold mb-4">Upload Soal & Kunci Jawaban Massal</h4>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">1. Upload Gambar Soal (.jpg, .png)</label>
                                <p className="text-xs text-gray-500 mb-2">Nama file harus mengandung nomor soal, contoh: "soal_1.jpg", "2.png".</p>
                                <div className="flex items-center space-x-2">
                                    <ImageIcon className="w-6 h-6 text-gray-500" />
                                    <input type="file" multiple accept="image/jpeg, image/png" onChange={(e) => setBulkImages(e.target.files)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                </div>
                                {bulkImages && <p className="text-xs text-green-600 mt-1">{bulkImages.length} file gambar dipilih.</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">2. Upload File Kunci Jawaban (.txt)</label>
                                <p className="text-xs text-gray-500 mb-2">Format per baris: `Nomor. Jawaban` (contoh: `1. A`).</p>
                                <div className="flex items-center space-x-2">
                                    <FileTextIcon className="w-6 h-6 text-gray-500" />
                                    <input type="file" accept=".txt" onChange={(e) => setBulkKeysFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                </div>
                                {bulkKeysFile && <p className="text-xs text-green-600 mt-1">{bulkKeysFile.name} dipilih.</p>}
                            </div>

                            {bulkUploadStatus.message && (
                                <div className={`p-3 rounded-md text-sm ${
                                    bulkUploadStatus.type === 'error' ? 'bg-red-100 text-red-700' :
                                    bulkUploadStatus.type === 'success' ? 'bg-green-100 text-green-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {bulkUploadStatus.message}
                                </div>
                            )}

                         </div>
                         <div className="flex items-center justify-end pt-6">
                            <button onClick={() => setIsBulkModalOpen(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-600">
                                {bulkUploadStatus.type === 'success' ? 'Selesai' : 'Batal'}
                            </button>
                            <button onClick={handleBulkUpload} disabled={!bulkImages || !bulkKeysFile || bulkUploadStatus.type === 'info'} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400">
                                Proses & Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankSoal;