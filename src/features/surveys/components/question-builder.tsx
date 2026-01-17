'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  ModalFooter,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  Bars3Icon,
  StarIcon,
  ListBulletIcon,
  ChatBubbleBottomCenterTextIcon,
  HashtagIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Question, QuestionType, CreateQuestionData } from '@/types';

const questionSchema = z.object({
  questionText: z.string().min(5, 'نص السؤال يجب أن يكون 5 أحرف على الأقل'),
  type: z.string(),
  isRequired: z.boolean().default(true),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  category: z.string().optional(),
  ratingMin: z.number().optional(),
  ratingMax: z.number().optional(),
  ratingMinLabel: z.string().optional(),
  ratingMaxLabel: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionBuilderProps {
  surveyId: string;
  questions: Question[];
  onAddQuestion: (data: CreateQuestionData) => void;
  onUpdateQuestion: (id: string, data: Partial<CreateQuestionData>) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (questionIds: string[]) => void;
  isLoading?: boolean;
}

const questionTypes: { value: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'rating', label: 'تقييم نجوم', icon: StarIcon },
  { value: 'single_choice', label: 'اختيار واحد', icon: CheckCircleIcon },
  { value: 'multiple_choice', label: 'اختيار متعدد', icon: ListBulletIcon },
  { value: 'textarea', label: 'نص طويل', icon: ChatBubbleBottomCenterTextIcon },
  { value: 'text', label: 'نص قصير', icon: ChatBubbleBottomCenterTextIcon },
  { value: 'scale', label: 'مقياس', icon: Bars3Icon },
  { value: 'yes_no', label: 'نعم / لا', icon: CheckCircleIcon },
  { value: 'number', label: 'رقم', icon: HashtagIcon },
  { value: 'date', label: 'تاريخ', icon: CalendarIcon },
];

export function QuestionBuilder({
  surveyId,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  isLoading,
}: QuestionBuilderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: '',
      type: 'single_choice',
      isRequired: true,
      description: '',
      placeholder: '',
      category: '',
      ratingMin: 1,
      ratingMax: 5,
      ratingMinLabel: '',
      ratingMaxLabel: '',
    },
  });

  const questionType = watch('type');

  const openAddModal = () => {
    reset({
      questionText: '',
      type: 'single_choice',
      isRequired: true,
      description: '',
      placeholder: '',
      category: '',
      ratingMin: 1,
      ratingMax: 5,
      ratingMinLabel: '',
      ratingMaxLabel: '',
    });
    setOptions(['']);
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    reset({
      questionText: question.questionText,
      type: question.type,
      isRequired: question.isRequired,
      description: question.description || '',
      placeholder: question.placeholder || '',
      category: question.category || '',
      ratingMin: question.ratingConfig?.min || 1,
      ratingMax: question.ratingConfig?.max || 5,
      ratingMinLabel: question.ratingConfig?.minLabel || '',
      ratingMaxLabel: question.ratingConfig?.maxLabel || '',
    });
    setOptions(question.options || ['']);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    reset();
    setOptions(['']);
  };

  const onSubmit = (data: QuestionFormData) => {
    const questionData: CreateQuestionData = {
      survey: surveyId,
      questionText: data.questionText,
      type: data.type as QuestionType,
      order: editingQuestion ? editingQuestion.order : questions.length + 1,
      isRequired: data.isRequired,
      description: data.description,
      placeholder: data.placeholder,
      category: data.category,
    };

    if (['single_choice', 'multiple_choice'].includes(data.type)) {
      questionData.options = options.filter((o) => o.trim() !== '');
    }

    if (['rating', 'scale'].includes(data.type)) {
      questionData.ratingConfig = {
        min: data.ratingMin || 1,
        max: data.ratingMax || 5,
        minLabel: data.ratingMinLabel || '',
        maxLabel: data.ratingMaxLabel || '',
        step: 1,
      };
    }

    if (editingQuestion) {
      onUpdateQuestion(editingQuestion._id, questionData);
    } else {
      onAddQuestion(questionData);
    }

    closeModal();
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="text-center py-12">
          <ListBulletIcon className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-700 mb-2">لا توجد أسئلة</h3>
          <p className="text-secondary-500 mb-6">ابدأ بإضافة سؤالك الأول</p>
          <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>
            إضافة سؤال
          </Button>
        </Card>
      ) : (
        <>
          {questions.map((question, index) => (
            <Card key={question._id} hover className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-secondary-900">{question.questionText}</h4>
                      {question.description && (
                        <p className="text-sm text-secondary-500 mt-1">{question.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-secondary-100 text-secondary-600 rounded">
                          {questionTypes.find((t) => t.value === question.type)?.label}
                        </span>
                        {question.isRequired && (
                          <span className="text-xs px-2 py-1 bg-danger-50 text-danger-600 rounded">
                            إلزامي
                          </span>
                        )}
                        {question.category && (
                          <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded">
                            {question.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(question)}
                        className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(question._id)}
                        className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Options Preview */}
                  {question.options && question.options.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {question.options.slice(0, 4).map((option, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                          <span className="w-4 h-4 rounded-full border border-secondary-300" />
                          {option}
                        </div>
                      ))}
                      {question.options.length > 4 && (
                        <p className="text-sm text-secondary-400">
                          +{question.options.length - 4} خيارات أخرى
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={openAddModal}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            إضافة سؤال جديد
          </Button>
        </>
      )}

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Question Type Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              نوع السؤال
            </label>
            <div className="grid grid-cols-3 gap-2">
              {questionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('type', type.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                      questionType === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <Textarea
            label="نص السؤال"
            placeholder="أدخل نص السؤال..."
            required
            rows={3}
            error={errors.questionText?.message}
            {...register('questionText')}
          />

          {/* Description */}
          <Input
            label="وصف السؤال (اختياري)"
            placeholder="توضيح إضافي للسؤال..."
            {...register('description')}
          />

          {/* Options for Choice Questions */}
          {['single_choice', 'multiple_choice'].includes(questionType) && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                الخيارات
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`الخيار ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1"
                    />
                    {options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-danger-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  إضافة خيار
                </Button>
              </div>
            </div>
          )}

          {/* Rating/Scale Config */}
          {['rating', 'scale'].includes(questionType) && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="الحد الأدنى"
                type="number"
                {...register('ratingMin', { valueAsNumber: true })}
              />
              <Input
                label="الحد الأقصى"
                type="number"
                {...register('ratingMax', { valueAsNumber: true })}
              />
              <Input
                label="تسمية الحد الأدنى"
                placeholder="مثال: ضعيف جداً"
                {...register('ratingMinLabel')}
              />
              <Input
                label="تسمية الحد الأقصى"
                placeholder="مثال: ممتاز"
                {...register('ratingMaxLabel')}
              />
            </div>
          )}

          {/* Category & Required */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الفئة (اختياري)"
              placeholder="مثال: المعرفة"
              {...register('category')}
            />
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isRequired"
                {...register('isRequired')}
                className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isRequired" className="text-sm text-secondary-700">
                سؤال إلزامي
              </label>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              إلغاء
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
