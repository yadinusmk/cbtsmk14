
import React, { useState } from 'react';
import { useAppContext } from '../../App';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';

const DataKelas = () => {
  const { classes, students, addClass, deleteClass } = useAppContext();
  const [newClassName, setNewClassName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName.trim()) {
      addClass({ nama: newClassName.trim() });
      setNewClassName('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Manajemen Data Kelas</h3>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
          <PlusIcon className="w-5 h-5 mr-2" />
          Tambah Kelas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Kelas</th>
              <th scope="col" className="px-6 py-3">Jumlah Siswa</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(kelas => {
              const studentCount = students.filter(s => s.kelasId === kelas.id).length;
              return (
                <tr key={kelas.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{kelas.nama}</td>
                  <td className="px-6 py-4">{studentCount}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteClass(kelas.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Tambah Kelas Baru</h4>
            <form onSubmit={handleAddClass}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nama Kelas</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
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

export default DataKelas;
