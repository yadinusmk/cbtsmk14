import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import DataPeserta from './DataPeserta';
import DataKelas from './DataKelas';
import DataMapel from './DataMapel';
import BankSoal from './BankSoal';
import JadwalUjian from './JadwalUjian';
import HasilUjian from './HasilUjian';

import DashboardIcon from '../../components/icons/DashboardIcon';
import UsersIcon from '../../components/icons/UsersIcon';
import ClassIcon from '../../components/icons/ClassIcon';
import BookIcon from '../../components/icons/BookIcon';
import QuestionIcon from '../../components/icons/QuestionIcon';
import ScheduleIcon from '../../components/icons/ScheduleIcon';
import ResultIcon from '../../components/icons/ResultIcon';
import LogoutIcon from '../../components/icons/LogoutIcon';
import KeyIcon from '../../components/icons/KeyIcon';
import useLocalStorage from '../../hooks/useLocalStorage';

interface AdminLayoutProps {
  onLogout: () => void;
}

type Menu = 'dashboard' | 'peserta' | 'kelas' | 'mapel' | 'bank_soal' | 'jadwal' | 'hasil';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'peserta', label: 'Data Peserta', icon: UsersIcon },
  { id: 'kelas', label: 'Data Kelas', icon: ClassIcon },
  { id: 'mapel', label: 'Data Mapel', icon: BookIcon },
  { id: 'bank_soal', label: 'Bank Soal', icon: QuestionIcon },
  { id: 'jadwal', label: 'Jadwal Ujian', icon: ScheduleIcon },
  { id: 'hasil', label: 'Hasil Ujian', icon: ResultIcon },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<Menu>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useLocalStorage('adminPassword', 'admini');
  const [passwordFields, setPasswordFields] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordFields.oldPassword !== adminPassword) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi lama salah.' });
      return;
    }
    if (!passwordFields.newPassword || passwordFields.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setAdminPassword(passwordFields.newPassword);
    setPasswordMessage({ type: 'success', text: 'Kata sandi berhasil diubah.' });
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordFields({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage({ type: '', text: '' });
    }, 1500);
  };


  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <AdminDashboard />;
      case 'peserta': return <DataPeserta />;
      case 'kelas': return <DataKelas />;
      case 'mapel': return <DataMapel />;
      case 'bank_soal': return <BankSoal />;
      case 'jadwal': return <JadwalUjian />;
      case 'hasil': return <HasilUjian />;
      default: return <AdminDashboard />;
    }
  };

  const activeMenuLabel = menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard';

  const NavLink: React.FC<{
      item: { id: Menu; label: string; icon: React.FC<{ className?: string }> };
      isActive: boolean;
      onClick: (menu: Menu) => void;
  }> = ({ item, isActive, onClick }) => (
      <a
          href="#"
          onClick={(e) => { e.preventDefault(); onClick(item.id); }}
          className={`flex items-center p-3 my-1 rounded-lg transition-colors ${
              isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-200 hover:bg-blue-500 hover:text-white'
          }`}
      >
          <item.icon className="w-6 h-6" />
          <span className="ml-4 font-medium">{item.label}</span>
      </a>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-2xl font-bold text-center">Admin Panel</h1>
        </div>
        <nav className="p-4 flex flex-col justify-between" style={{height: 'calc(100vh - 65px)'}}>
          <div>
            {menuItems.map(item => (
              <NavLink 
                key={item.id} 
                item={item as any} 
                isActive={activeMenu === item.id} 
                onClick={() => { setActiveMenu(item.id as Menu); setSidebarOpen(false); }} 
              />
            ))}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center p-3 my-1 w-full rounded-lg text-gray-200 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogoutIcon className="w-6 h-6" />
            <span className="ml-4 font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 focus:outline-none md:hidden mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">{activeMenuLabel}</h2>
          </div>
          <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
            <KeyIcon className="w-5 h-5 mr-2" />
            Ganti Password
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h4 className="text-lg font-bold mb-4">Ganti Password Admin</h4>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password Lama</label>
                <input type="password" name="oldPassword" value={passwordFields.oldPassword} onChange={handlePasswordChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password Baru</label>
                <input type="password" name="newPassword" value={passwordFields.newPassword} onChange={handlePasswordChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Konfirmasi Password Baru</label>
                <input type="password" name="confirmPassword" value={passwordFields.confirmPassword} onChange={handlePasswordChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>
              
              {passwordMessage.text && (
                  <p className={`text-sm text-center mb-4 ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {passwordMessage.text}
                  </p>
              )}

              <div className="flex items-center justify-end">
                <button onClick={() => setIsPasswordModalOpen(false)} type="button" className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">Batal</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;