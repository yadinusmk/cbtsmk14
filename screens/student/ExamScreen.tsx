
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { JadwalUjian, Soal, JawabanSiswa, HasilUjian } from '../../types';
import { useAppContext } from '../../App';

interface ExamScreenProps {
  exam: JadwalUjian;
  studentId: string;
  onFinishExam: (result: Omit<HasilUjian, 'id'>) => void;
}

// Fisher-Yates shuffle algorithm for robust shuffling
const shuffleArray = (array: Soal[]): Soal[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const ExamScreen: React.FC<ExamScreenProps> = ({ exam, studentId, onFinishExam }) => {
  const { questions, addResult, shuffleQuestions } = useAppContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<JawabanSiswa[]>([]);
  const [timeLeft, setTimeLeft] = useState(exam.durasi * 60);

  const examQuestions = useMemo(() => {
    const allQuestionsForSubject = questions.filter(q => q.mapelId === exam.mapelId);
    const questionsToUse = shuffleQuestions ? shuffleArray(allQuestionsForSubject) : allQuestionsForSubject;
    return questionsToUse.slice(0, exam.jumlahSoal);
  }, [questions, exam.mapelId, exam.jumlahSoal, shuffleQuestions]);

  useEffect(() => {
    if (examQuestions.length > 0) {
      setAnswers(examQuestions.map(q => ({ soalId: q.id, jawaban: null })));
    }
  }, [examQuestions]);

  const handleSubmit = useCallback(() => {
    const multipleChoiceQuestions = examQuestions.filter(q => q.tipe === 'pilihan_ganda');
    const totalMcQuestions = multipleChoiceQuestions.length;

    let correctAnswers = 0;
    multipleChoiceQuestions.forEach(question => {
        const studentAnswer = answers.find(a => a.soalId === question.id);
        if (studentAnswer && question.kunciJawaban === studentAnswer.jawaban) {
            correctAnswers++;
        }
    });

    const score = totalMcQuestions > 0 ? (correctAnswers / totalMcQuestions) * 100 : 0;
    const result: Omit<HasilUjian, 'id'> = {
        siswaId: studentId,
        jadwalId: exam.id,
        nilai: score,
        jawaban: answers,
        selesaiPada: new Date().toISOString(),
        detailNilai: {
            benar: correctAnswers,
            totalSoalPg: totalMcQuestions,
        }
    };
    addResult(result);
    onFinishExam(result);
  }, [answers, examQuestions, studentId, exam.id, addResult, onFinishExam]);


  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const handleAnswerSelect = (soalId: string, jawaban: string) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(ans =>
        ans.soalId === soalId ? { ...ans, jawaban } : ans
      )
    );
  };
  
  const isAnswered = (question: Soal): boolean => {
      const answer = answers.find(a => a.soalId === question.id);
      if (!answer) return false;
      if (question.tipe === 'essay') {
          return answer.jawaban !== null && answer.jawaban.trim() !== '';
      }
      return answer.jawaban !== null;
  };

  if (examQuestions.length === 0 || answers.length === 0) {
      return <div className="p-8 flex items-center justify-center h-screen">Memuat soal...</div>
  }
  
  const currentQuestion = examQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden h-[90vh]">
        
        {/* Left Panel: Question */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-700">No. Soal : {currentQuestionIndex + 1}</h2>
          
          <div className="bg-gray-800 p-6 flex-grow overflow-y-auto mb-6 rounded-lg">
            {currentQuestion.gambar && (
              <img src={currentQuestion.gambar} alt="Soal" className="mb-4 mx-auto max-h-72 object-contain rounded-md" />
            )}
            <p className="text-lg text-white">{currentQuestion.pertanyaan}</p>
          </div>

          {currentQuestion.tipe === 'pilihan_ganda' && (
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {['A', 'B', 'C', 'D', 'E'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={`
                    w-16 h-16 border-2 text-xl font-bold rounded
                    ${answers.find(a => a.soalId === currentQuestion.id)?.jawaban === option 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.tipe === 'essay' && (
             <div className="mb-6">
                <label htmlFor="essay-answer" className="font-semibold text-gray-700">Jawaban Anda:</label>
                <textarea
                    id="essay-answer"
                    rows={5}
                    className="mt-2 w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ketik jawaban Anda di sini..."
                    value={answers.find(a => a.soalId === currentQuestion.id)?.jawaban || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                />
            </div>
          )}

          <div className="flex justify-between mt-auto">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-8 py-3 border-2 border-gray-400 font-bold rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === examQuestions.length - 1}
              className="px-8 py-3 border-2 border-gray-400 font-bold rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>

        </div>

        {/* Right Panel: Navigation */}
        <aside className="w-full md:w-80 bg-gray-100 p-6 border-l border-gray-200 flex flex-col">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-lg text-gray-700">Sisa Waktu</h3>
            <p className="text-3xl font-bold text-red-500">
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
        
          <div className="border-2 border-gray-400 p-4 mb-4 flex-grow overflow-y-auto">
            <h3 className="text-center font-bold text-xl mb-4">Navigasi</h3>
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    h-10 w-10 flex items-center justify-center rounded-sm border-2 border-gray-400 text-sm font-semibold transition-colors
                    ${index === currentQuestionIndex 
                      ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-offset-1 ring-blue-500' 
                      : isAnswered(q) 
                        ? 'bg-green-500 text-white border-green-600' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="border-2 border-gray-400 p-4 mb-4">
             <ul>
                 <li className="flex items-center text-sm mb-1">
                     <div className="w-4 h-4 bg-green-500 border border-gray-400 mr-2"></div>
                     Sudah dikerjakan
                 </li>
                 <li className="flex items-center text-sm">
                     <div className="w-4 h-4 bg-white border border-gray-400 mr-2"></div>
                     Belum dikerjakan
                 </li>
             </ul>
          </div>

          <button
            onClick={() => {
                if(window.confirm('Apakah Anda yakin ingin menyelesaikan ujian?')) {
                    handleSubmit();
                }
            }}
            className="w-full mt-auto py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
          >
            Selesai Ujian
          </button>
        </aside>

      </div>
    </div>
  );
};

export default ExamScreen;
