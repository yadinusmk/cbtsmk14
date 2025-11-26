import React, { useState } from 'react';
import { User, Siswa } from '../types';
import { useAppContext } from '../App';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const context = useAppContext();
  const students = context?.students || [];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const adminPassword = JSON.parse(localStorage.getItem('adminPassword') || JSON.stringify('admini'));
    if (username.toLowerCase() === 'admin' && password === adminPassword) {
      onLogin({ id: 'admin-user', nis: 'admin', nama: 'Administrator', role: 'admin' });
      return;
    }

    const student = students.find(s => s.nis === username && s.password === password);
    if (student) {
      onLogin({ id: student.id, nis: student.nis, nama: student.nama, role: 'student' });
      return;
    }
    
    setError('Username atau password salah.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h1 className="text-2xl font-bold text-gray-800">SMKN 14 Pandeglang</h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">Aplikasi Ujian Online</h2>
            <p className="text-gray-500 mt-1">Silakan login untuk melanjutkan.</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin}>
          <div className="mb-4 relative">
            <label htmlFor="username" className="sr-only">Username (NIS)</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Username (NIS untuk siswa)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6 relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Login
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;