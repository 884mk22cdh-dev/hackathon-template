import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";

const client = new Anthropic();

export async function POST(req: Request) {
  const { subject, grade, topic, language } = await req.json();

  if (!subject || !grade || !topic) {
    return NextResponse.json({ error: "Заполни все поля" }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Предмет: ${subject}\nКласс: ${grade}\nТема: ${topic}\nЯзык ответа: ${language ?? "русский"}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "Модель отказалась отвечать на этот запрос" }, { status: 422 });
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ result: text });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Неверный ANTHROPIC_API_KEY" }, { status: 500 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Лимит запросов, попробуй через минуту" }, { status: 429 });
    }
    console.error(err);
    return NextResponse.json({ error: "Ошибка генерации" }, { status: 500 });
  }
}
