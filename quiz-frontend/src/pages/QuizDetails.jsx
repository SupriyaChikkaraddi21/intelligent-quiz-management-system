import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${id}/`);
      setQuiz(res.data);
    } catch (err) {
      console.error("Failed to load quiz", err);
    }
  };

  if (!quiz) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
      <p>Difficulty: {quiz.difficulty}</p>
    </div>
  );
}