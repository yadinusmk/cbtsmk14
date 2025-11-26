
import React, { useState, useRef, ChangeEvent } from 'react';
import { useAppContext } from '../../App';
import { Siswa } from '../../types';
import PlusIcon from '../../components/icons/PlusIcon';
import UploadIcon from '../../components/icons/UploadIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import DownloadIcon from '../../components/icons/DownloadIcon';

declare const XLSX: any;

const DataPeserta = () => {
  const { students, classes, addStudent, deleteStudent, setStudents } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ nis: '', nama: '', kelasId: '', password: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.nis && newStudent.nama && newStudent.kelasId && newStudent.password) {
      addStudent(newStudent);
      setNewStudent({ nis: '', nama: '', kelasId: '', password: '' });
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newStudents: Siswa[] = json.map((row: any) => {
          const kelas = classes.find(k => k.nama.toLowerCase() === (row.Kelas || row.kelas)?.toString().toLowerCase());
          return {
            id: Date.now().toString() + Math.random(),
            nis: (row.NIS || row.nis)?.toString() || '',
            nama: (row['Nama Siswa'] || row.nama)?.toString() || '',
            password: (row.Password || row.password)?.toString() || '',
            kelasId: kelas ? kelas.id : '',
          };
        }).filter(s => s.nis && s.nama && s.kelasId && s.password);

        setStudents(prev => [...prev, ...newStudents]);
        alert(`${newStudents.length} siswa berhasil diimpor.`);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Gagal memproses file Excel. Pastikan formatnya benar dengan kolom: NIS, Nama Siswa, Kelas, Password.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const data = [
      ["NIS", "Nama Siswa", "Kelas", "Password"],
      ["123456789", "Contoh Siswa", "Nama Kelas Yang Ada", "passwordcontoh"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "template_upload_siswa.xlsx");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Manajemen Data Peserta</h3>
        <div className="flex space-x-2">
          <button onClick={handleDownloadTemplate} className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200">
            <DownloadIcon className="w-5 h-5 mr-2" />
            Template
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200">
            <UploadIcon className="w-5 h-5 mr-2" />
            Upload Siswa
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            <PlusIcon className="w-5 h-5 mr-2" />
            Tambah Siswa
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">NIS</th>
              <th scope="col" className="px-6 py-3">Nama Siswa</th>
              <th scope="col" className="px-6 py-3">Kelas</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{student.nis}</td>
                <td className="px-6 py-4">{student.nama}</td>
                <td className="px-6 py-4">{classes.find(k => k.id === student.kelasId)?.nama || 'N/A'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteStudent(student.id)} className="text-red-500 hover:text-red-700">
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
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Tambah Siswa Baru</h4>
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">NIS</label>
                <input type="text" name="nis" value={newStudent.nis} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nama Siswa</label>
                <input type="text" name="nama" value={newStudent.nama} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" name="password" value={newStudent.password} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Kelas</label>
                <select name="kelasId" value={newStudent.kelasId} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                  <option value="">Pilih Kelas</option>
                  {classes.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end">
                <button onClick={() => setIsModalOpen(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">Batal</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPeserta;
