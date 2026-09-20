"use client";

import { useState } from "react";

export default function Home() {
  const [subject, setSubject] = useState("Математика");
  const [grade, setGrade] = useState("7");
  const [topic, setTopic] = useState("Линейные уравнения");
  const [language, setLanguage] = useState("русский");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, topic, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Помощник учителя</h1>
      <p className="mt-2 text-gray-600">
        Введи предмет, класс и тему. Агент подготовит план урока, вопросы и домашнее задание.
      </p>

      <form onSubmit={generate} className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Предмет
          <input className="rounded border px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          Класс
          <input className="rounded border px-3 py-2" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          Тема урока
          <input className="rounded border px-3 py-2" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          Язык
          <select className="rounded border px-3 py-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="русский">Русский</option>
            <option value="казахский">Қазақша</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="self-end rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Генерирую..." : "Сгенерировать"}
        </button>
      </form>

      {error && <p className="mt-6 rounded bg-red-50 p-3 text-red-700">{error}</p>}

      {result && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Результат</h2>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="rounded border px-3 py-1 text-sm"
            >
              Скопировать
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-4 text-sm leading-relaxed">{result}</pre>
        </section>
      )}
    </main>
  );
}
