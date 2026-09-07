"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { EQ_TEST_QUESTIONS, EQ_TEST_TOTAL } from "@/lib/eq-test/questions";
import type { EqQuestion, EqTestAnswers } from "@/lib/eq-test/types";

type EqTestQuizProps = {
  questionIndex: number;
  answers: EqTestAnswers;
  elapsedSeconds: number;
  onAnswer: (questionId: string, value: number | string) => void;
  onContinueCheckpoint: () => void;
  onBack: () => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function QuestionOptions({
  question,
  answers,
  onAnswer,
}: {
  question: EqQuestion;
  answers: EqTestAnswers;
  onAnswer: (questionId: string, value: number | string) => void;
}) {
  if (question.type === "scenario") {
    const selected = answers[question.id];
    return (
      <div className="space-y-4">
        <p className="whitespace-pre-line text-center text-lg font-medium leading-snug text-slate-800 dark:text-slate-100">
          {question.question}
        </p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const label = String.fromCharCode(65 + i);
            const isSelected = selected === i;
            return (
              <button
                key={`${label}-${opt}`}
                type="button"
                onClick={() => onAnswer(question.id, i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                  isSelected
                    ? "border-teal-500 bg-teal-50 ring-2 ring-teal-200 dark:bg-teal-950/40 dark:ring-teal-800"
                    : "border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                } text-slate-700 dark:text-slate-200`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isSelected
                      ? "bg-teal-600 text-white"
                      : "bg-slate-900/80 text-white dark:bg-slate-600"
                  }`}
                >
                  {label}
                </span>
                <span className="flex-1">{opt}</span>
                <ArrowRightIcon className="size-4 shrink-0 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "choice") {
    return (
      <div className="space-y-3">
        <p className="text-center text-lg font-medium text-slate-800 dark:text-slate-100">
          {question.question}
        </p>
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onClick={() => onAnswer(question.id, i)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>{opt}</span>
              <ArrowRightIcon className="size-4 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function EqTestQuiz({
  questionIndex,
  answers,
  elapsedSeconds,
  onAnswer,
  onContinueCheckpoint,
  onBack,
}: EqTestQuizProps) {
  const question = EQ_TEST_QUESTIONS[questionIndex];
  const progress = ((questionIndex + 1) / EQ_TEST_TOTAL) * 100;

  if (question.type === "checkpoint") {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={questionIndex === 0}
            className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-30 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
            aria-label="Previous question"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
          <span className="text-sm font-medium text-slate-500">
            {questionIndex + 1}/{EQ_TEST_TOTAL}
          </span>
          <div className="size-9" />
        </div>

        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {question.highlight && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-600">
              {question.highlight}
            </p>
          )}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {question.title}
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            {question.message}
          </p>
          <Button
            className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700"
            size="lg"
            onClick={onContinueCheckpoint}
          >
            Continue
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={questionIndex === 0}
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-30 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
          aria-label="Previous question"
        >
          <ArrowLeftIcon className="size-4" />
        </button>
        <span className="text-sm font-medium text-slate-500">
          {questionIndex + 1}/{EQ_TEST_TOTAL}
        </span>
        <div className="size-9" />
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-[#faf8f5] px-5 py-8 dark:border-slate-700 dark:bg-slate-900/80">
        <QuestionOptions
          question={question}
          answers={answers}
          onAnswer={onAnswer}
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
        <ClockIcon className="size-4" />
        <span>{formatTime(elapsedSeconds)}</span>
      </div>
    </div>
  );
}

export function EqTestIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-lg text-center">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:rounded-3xl sm:px-6 sm:py-10 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          <HeartIcon className="size-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Emotional Intelligence Test
        </h1>
        <p className="mt-3 text-sm text-pretty text-slate-600 sm:text-base dark:text-slate-300">
          {EQ_TEST_TOTAL} situational questions covering self-awareness,
          regulation, empathy, social skills, and motivation. Allow about 12–15
          minutes.
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-slate-600 dark:text-slate-400">
          <li>• Realistic workplace and relationship scenarios</li>
          <li>• Choose the response that best fits how you would act</li>
          <li>• Your detailed EQ report unlocks after completion</li>
        </ul>
        <Button
          className="mt-8 h-12 w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
          onClick={onStart}
        >
          Start test
          <ArrowRightIcon className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

export function EqTestConfirmation({
  onGetResults,
  onEdit,
}: {
  onGetResults: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl">
      <div className="flex flex-col items-center gap-8 rounded-2xl border border-slate-200 bg-[#faf8f5] px-4 py-8 sm:rounded-3xl sm:px-6 sm:py-10 md:flex-row md:px-10 dark:border-slate-700 dark:bg-slate-900/80">
        <div className="min-w-0 flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Well done!
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            You finished the EQ test. Your personalized emotional intelligence
            report is ready to generate.
          </p>
          <Button
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 md:w-auto"
            size="lg"
            onClick={onGetResults}
          >
            Get my results
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 block w-full text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700 md:w-auto"
          >
            Edit my answers
          </button>
        </div>
        <div className="flex size-40 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-teal-600 dark:border-slate-600 dark:bg-slate-800 dark:text-teal-300">
          <SparklesIcon className="size-16" />
        </div>
      </div>
    </div>
  );
}
