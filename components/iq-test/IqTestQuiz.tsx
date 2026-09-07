"use client";

import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  IQ_OPTION_COUNT,
  IQ_TEST_GUIDELINES_IMAGE,
  iqOptionImage,
  iqQuestionImage,
} from "@/lib/iq-test/images";
import { IQ_TEST_QUESTIONS, IQ_TEST_TOTAL } from "@/lib/iq-test/questions";
import type { IqQuestion, IqTestAnswers } from "@/lib/iq-test/types";

type IqTestQuizProps = {
  questionIndex: number;
  answers: IqTestAnswers;
  elapsedSeconds: number;
  onAnswer: (questionId: string, value: number | string) => void;
  onContinueCheckpoint: () => void;
  onBack: () => void;
  onEditAnswers?: () => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ImageOptionButton({
  src,
  alt,
  label,
  selected,
  onClick,
}: {
  src: string;
  alt: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-white p-1.5 transition hover:border-blue-400 hover:shadow-sm dark:bg-slate-900 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
          : "border-slate-200 dark:border-slate-700"
      }`}
      aria-label={`Option ${label}`}
    >
      <div className="relative aspect-square w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 28vw, 120px"
          className="object-contain p-1"
        />
      </div>
      <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-slate-900/80 text-[10px] font-bold text-white">
        {label}
      </span>
    </button>
  );
}

function QuestionOptions({
  question,
  answers,
  onAnswer,
}: {
  question: IqQuestion;
  answers: IqTestAnswers;
  onAnswer: (questionId: string, value: number | string) => void;
}) {
  if (question.type === "image") {
    const selected = answers[question.id];
    const showQuestionImage = question.hasQuestionImage !== false;

    return (
      <div className="space-y-4">
        {showQuestionImage ? (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-slate-800">
            <Image
              src={iqQuestionImage(question.questionNumber)}
              alt={`Question ${question.questionNumber}`}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-contain p-2"
              priority
            />
          </div>
        ) : (
          <p className="text-center text-base font-medium text-slate-700 dark:text-slate-200">
            Which option completes the pattern?
          </p>
        )}
        {!showQuestionImage ? null : (
          <p className="text-center text-sm text-slate-500">
            Which option completes the pattern?
          </p>
        )}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: IQ_OPTION_COUNT }, (_, i) => {
            const optNum = i + 1;
            const label = String.fromCharCode(65 + i);
            return (
              <ImageOptionButton
                key={optNum}
                src={iqOptionImage(question.questionNumber, optNum)}
                alt={`Question ${question.questionNumber}, option ${optNum}`}
                label={label}
                selected={selected === i}
                onClick={() => onAnswer(question.id, i)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "logic") {
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
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 dark:bg-blue-950/40 dark:ring-blue-800"
                    : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                } text-slate-700 dark:text-slate-200`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isSelected
                      ? "bg-blue-600 text-white"
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
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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

export default function IqTestQuiz({
  questionIndex,
  answers,
  elapsedSeconds,
  onAnswer,
  onContinueCheckpoint,
  onBack,
}: IqTestQuizProps) {
  const question = IQ_TEST_QUESTIONS[questionIndex];
  const progress = ((questionIndex + 1) / IQ_TEST_TOTAL) * 100;

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
            {questionIndex + 1}/{IQ_TEST_TOTAL}
          </span>
          <div className="size-9" />
        </div>

        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-6 text-center">
          {question.transitionImage && (
            <div className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <Image
                src={question.transitionImage}
                alt={question.title}
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-cover"
              />
            </div>
          )}
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {question.highlight && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
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
          {questionIndex + 1}/{IQ_TEST_TOTAL}
        </span>
        <div className="size-9" />
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
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

export function IqTestIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-lg text-center">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:rounded-3xl sm:px-6 sm:py-10 dark:border-slate-700 dark:bg-slate-900">
        <div className="relative mx-auto mb-6 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800">
          <Image
            src={IQ_TEST_GUIDELINES_IMAGE}
            alt="IQ test guidelines"
            fill
            sizes="(max-width: 640px) 80vw, 384px"
            className="object-contain p-2"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          IQ Test
        </h1>
        <p className="mt-3 text-sm text-pretty text-slate-600 sm:text-base dark:text-slate-300">
          {IQ_TEST_TOTAL} questions mixing visual puzzles, logical reasoning, and
          a short profile section. Allow about 15 minutes.
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-slate-600 dark:text-slate-400">
          <li>• Visual pattern puzzles measure spatial logic</li>
          <li>• Number, verbal, and analogy items test logical reasoning</li>
          <li>• Your detailed score report unlocks after completion</li>
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

export function IqTestConfirmation({
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
            You finished the IQ test. Your personalized cognitive report is ready
            to generate.
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
        <div className="relative flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
          <Image
            src="/images/iq-test/iq-q22-question.png"
            alt="Sample puzzle completed"
            fill
            sizes="160px"
            className="object-contain p-3"
          />
        </div>
      </div>
    </div>
  );
}
