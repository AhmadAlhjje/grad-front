'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardHeader, Button, Input, Textarea, ProgressBar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import type { Survey, Question, Answer } from '@/types';

interface SurveyFillFormProps {
  survey: Survey;
  questions: Question[];
  onSubmit: (answers: Answer[]) => void;
  onSaveDraft: (answers: Answer[]) => void;
  isSubmitting?: boolean;
  isSaving?: boolean;
}

export function SurveyFillForm({
  survey,
  questions,
  onSubmit,
  onSaveDraft,
  isSubmitting,
  isSaving,
}: SurveyFillFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { control, handleSubmit, watch, setValue, getValues } = useForm<Record<string, unknown>>({
    defaultValues: questions.reduce((acc, q) => ({ ...acc, [q._id]: null }), {}),
  });

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const totalQuestions = sortedQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const answeredQuestions = sortedQuestions.filter((q) => {
    const value = watch(q._id);
    return value !== null && value !== undefined && value !== '';
  }).length;

  const requiredQuestions = sortedQuestions.filter((q) => q.isRequired);
  const answeredRequired = requiredQuestions.filter((q) => {
    const value = watch(q._id);
    return value !== null && value !== undefined && value !== '';
  }).length;

  const canSubmit = answeredRequired === requiredQuestions.length;

  const buildAnswers = (): Answer[] => {
    const values = getValues();
    return sortedQuestions.map((q) => {
      const value = values[q._id];
      const answer: Answer = {
        question: q._id,
        valueType: getValueType(q.type),
      };

      switch (q.type) {
        case 'rating':
        case 'scale':
        case 'number':
          answer.numberValue = value as number;
          break;
        case 'yes_no':
          answer.booleanValue = value as boolean;
          break;
        case 'multiple_choice':
          answer.arrayValue = value as string[];
          break;
        default:
          answer.textValue = value as string;
      }

      return answer;
    });
  };

  const getValueType = (type: string): 'text' | 'number' | 'boolean' | 'array' => {
    switch (type) {
      case 'rating':
      case 'scale':
      case 'number':
        return 'number';
      case 'yes_no':
        return 'boolean';
      case 'multiple_choice':
        return 'array';
      default:
        return 'text';
    }
  };

  const handleFormSubmit = () => {
    onSubmit(buildAnswers());
  };

  const handleSaveDraft = () => {
    onSaveDraft(buildAnswers());
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'rating':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value as number}
                onChange={field.onChange}
                max={question.ratingConfig?.max || 5}
                minLabel={question.ratingConfig?.minLabel}
                maxLabel={question.ratingConfig?.maxLabel}
              />
            )}
          />
        );

      case 'scale':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <ScaleInput
                value={field.value as number}
                onChange={field.onChange}
                min={question.ratingConfig?.min || 0}
                max={question.ratingConfig?.max || 10}
                minLabel={question.ratingConfig?.minLabel}
                maxLabel={question.ratingConfig?.maxLabel}
              />
            )}
          />
        );

      case 'single_choice':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <SingleChoiceInput
                options={question.options || []}
                value={field.value as string}
                onChange={field.onChange}
              />
            )}
          />
        );

      case 'multiple_choice':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <MultipleChoiceInput
                options={question.options || []}
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
            )}
          />
        );

      case 'yes_no':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <YesNoInput value={field.value as boolean} onChange={field.onChange} />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <Textarea
                placeholder={question.placeholder || 'أدخل إجابتك هنا...'}
                rows={5}
                value={field.value as string || ''}
                onChange={field.onChange}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                placeholder={question.placeholder || 'أدخل الرقم...'}
                value={field.value as string || ''}
                onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <Input
                type="date"
                value={field.value as string || ''}
                onChange={field.onChange}
              />
            )}
          />
        );

      default:
        return (
          <Controller
            name={question._id}
            control={control}
            render={({ field }) => (
              <Input
                placeholder={question.placeholder || 'أدخل إجابتك...'}
                value={field.value as string || ''}
                onChange={field.onChange}
              />
            )}
          />
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-secondary-600">
            السؤال {currentQuestionIndex + 1} من {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar value={progress} size="sm" />
        <div className="flex items-center justify-between mt-3 text-sm text-secondary-500">
          <span>الأسئلة المجابة: {answeredQuestions}</span>
          <span>الإلزامية المتبقية: {requiredQuestions.length - answeredRequired}</span>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="mb-6">
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium flex-shrink-0">
              {currentQuestionIndex + 1}
            </span>
            <div>
              <h3 className="text-lg font-medium text-secondary-900">
                {currentQuestion.questionText}
                {currentQuestion.isRequired && (
                  <span className="text-danger-500 mr-1">*</span>
                )}
              </h3>
              {currentQuestion.description && (
                <p className="text-secondary-500 mt-1">{currentQuestion.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="py-4">{renderQuestionInput(currentQuestion)}</div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
          >
            السابق
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={goToNext}>التالي</Button>
          ) : (
            <Button
              onClick={handleFormSubmit}
              isLoading={isSubmitting}
              disabled={!canSubmit}
            >
              إرسال الاستبيان
            </Button>
          )}
        </div>

        <Button variant="ghost" onClick={handleSaveDraft} isLoading={isSaving}>
          حفظ كمسودة
        </Button>
      </div>

      {/* Question Navigator */}
      <Card className="mt-6">
        <CardHeader title="الانتقال السريع" />
        <div className="flex flex-wrap gap-2">
          {sortedQuestions.map((q, index) => {
            const value = watch(q._id);
            const isAnswered = value !== null && value !== undefined && value !== '';
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                  isCurrent
                    ? 'bg-primary-600 text-white'
                    : isAnswered
                    ? 'bg-success-100 text-success-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// Rating Input Component
function RatingInput({
  value,
  onChange,
  max = 5,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: max }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            className="p-1 transition-transform hover:scale-110"
          >
            {value && index < value ? (
              <StarIcon className="h-10 w-10 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-10 w-10 text-secondary-300" />
            )}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-2 text-sm text-secondary-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// Scale Input Component
function ScaleInput({
  value,
  onChange,
  min = 0,
  max = 10,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: max - min + 1 }).map((_, index) => {
          const num = min + index;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={cn(
                'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                value === num
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              )}
            >
              {num}
            </button>
          );
        })}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-2 text-sm text-secondary-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// Single Choice Input
function SingleChoiceInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
            value === option
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-200 hover:border-secondary-300'
          )}
        >
          <input
            type="radio"
            name="single-choice"
            checked={value === option}
            onChange={() => onChange(option)}
            className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
          />
          <span className="text-secondary-700">{option}</span>
        </label>
      ))}
    </div>
  );
}

// Multiple Choice Input
function MultipleChoiceInput({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
            value.includes(option)
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-200 hover:border-secondary-300'
          )}
        >
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={() => toggleOption(option)}
            className="w-4 h-4 rounded text-primary-600 border-secondary-300 focus:ring-primary-500"
          />
          <span className="text-secondary-700">{option}</span>
        </label>
      ))}
    </div>
  );
}

// Yes/No Input
function YesNoInput({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'px-8 py-4 rounded-lg font-medium transition-all',
          value === true
            ? 'bg-success-500 text-white'
            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
        )}
      >
        نعم
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'px-8 py-4 rounded-lg font-medium transition-all',
          value === false
            ? 'bg-danger-500 text-white'
            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
        )}
      >
        لا
      </button>
    </div>
  );
}
