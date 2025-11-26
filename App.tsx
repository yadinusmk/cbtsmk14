import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { Siswa, Kelas, MataPelajaran, Soal, JadwalUjian, HasilUjian, User } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import LoginScreen from './screens/LoginScreen';
import AdminLayout from './screens/admin/AdminLayout';
import StudentDashboard from './screens/student/StudentDashboard';
import ExamScreen from './screens/student/ExamScreen';
import ResultScreen from './screens/student/ResultScreen';

interface AppContextType {
  // Data
  students: Siswa[];
  classes: Kelas[];
  subjects: MataPelajaran[];
  questions: Soal[];
  schedules: JadwalUjian[];
  results: HasilUjian[];
  showScores: boolean;
  shuffleQuestions: boolean;
  
  // Actions
  setStudents: React.Dispatch<React.SetStateAction<Siswa[]>>;
  addStudent: (student: Omit<Siswa, 'id'>) => void;
  deleteStudent: (id: string) => void;
  
  setClasses: React.Dispatch<React.SetStateAction<Kelas[]>>;
  addClass: (kelas: Omit<Kelas, 'id'>) => void;
  deleteClass: (id: string) => void;

  setSubjects: React.Dispatch<React.SetStateAction<MataPelajaran[]>>;
  addSubject: (subject: Omit<MataPelajaran, 'id'>) => void;
  deleteSubject: (id: string) => void;

  setQuestions: React.Dispatch<React.SetStateAction<Soal[]>>;
  addQuestion: (question: Omit<Soal, 'id'>) => void;
  deleteQuestion: (id: string) => void;
  
  setSchedules: React.Dispatch<React.SetStateAction<JadwalUjian[]>>;
  addSchedule: (schedule: Omit<JadwalUjian, 'id'>) => void;
  deleteSchedule: (id: string) => void;

  addResult: (result: Omit<HasilUjian, 'id'>) => void;
  deleteResult: (id: string) => void;
  setShowScores: React.Dispatch<React.SetStateAction<boolean>>;
  setShuffleQuestions: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [students, setStudents] = useLocalStorage<Siswa[]>('students', []);
    const [classes, setClasses] = useLocalStorage<Kelas[]>('classes', []);
    const [subjects, setSubjects] = useLocalStorage<MataPelajaran[]>('subjects', []);
    const [questions, setQuestions] = useLocalStorage<Soal[]>('questions', []);
    const [schedules, setSchedules] = useLocalStorage<JadwalUjian[]>('schedules', []);
    const [results, setResults] = useLocalStorage<HasilUjian[]>('results', []);
    const [showScores, setShowScores] = useLocalStorage<boolean>('showScores', true);
    const [shuffleQuestions, setShuffleQuestions] = useLocalStorage<boolean>('shuffleQuestions', true);

    const createAction = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => 
        (item: Omit<T, 'id'>) => {
            setter(prev => [...prev, { ...item, id: Date.now().toString() } as T]);
        };
    
    const deleteAction = <T extends {id: string}>(setter: React.Dispatch<React.SetStateAction<T[]>>) => 
        (id: string) => {
            setter(prev => prev.filter(item => item.id !== id));
        };

    const value = {
        students, setStudents, addStudent: createAction(setStudents), deleteStudent: deleteAction(setStudents),
        classes, setClasses, addClass: createAction(setClasses), deleteClass: deleteAction(setClasses),
        subjects, setSubjects, addSubject: createAction(setSubjects), deleteSubject: deleteAction(setSubjects),
        questions, setQuestions, addQuestion: createAction(setQuestions), deleteQuestion: deleteAction(setQuestions),
        schedules, setSchedules, addSchedule: createAction(setSchedules), deleteSchedule: deleteAction(setSchedules),
        results, addResult: createAction(setResults), deleteResult: deleteAction(setResults),
        showScores, setShowScores,
        shuffleQuestions, setShuffleQuestions,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


const App = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [activeView, setActiveView] = useState<'dashboard' | 'exam' | 'result'>('dashboard');
  const [selectedExam, setSelectedExam] = useState<JadwalUjian | null>(null);
  const [lastResult, setLastResult] = useState<HasilUjian | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
    setSelectedExam(null);
    setLastResult(null);
  };

  const handleStartExam = (exam: JadwalUjian) => {
    setSelectedExam(exam);
    setActiveView('exam');
  };
  
  const handleFinishExam = (result: Omit<HasilUjian, 'id'>) => {
      const newResult = { ...result, id: Date.now().toString() };
      setLastResult(newResult);
      setActiveView('result');
  };

  const handleBackToDashboard = () => {
      setActiveView('dashboard');
      setSelectedExam(null);
      setLastResult(null);
  };

  if (!currentUser) {
    return (
      <AppProvider>
        <LoginScreen onLogin={handleLogin} />
      </AppProvider>
    );
  }

  if (currentUser.role === 'admin') {
    return (
      <AppProvider>
        <AdminLayout onLogout={handleLogout} />
      </AppProvider>
    );
  }

  if (currentUser.role === 'student') {
    return (
      <AppProvider>
        <div className="min-h-screen bg-gray-100">
           {activeView === 'dashboard' && <StudentDashboard user={currentUser} onStartExam={handleStartExam} onLogout={handleLogout}/>}
           {activeView === 'exam' && selectedExam && <ExamScreen exam={selectedExam} studentId={currentUser.id} onFinishExam={handleFinishExam} />}
           {activeView === 'result' && lastResult && <ResultScreen result={lastResult} onBackToDashboard={handleBackToDashboard} />}
        </div>
      </AppProvider>
    );
  }

  return <div>Error: Invalid user role.</div>;
};

export default App;