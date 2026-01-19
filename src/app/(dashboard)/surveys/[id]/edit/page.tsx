'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSurvey,
  useSurveyQuestions,
  useUpdateSurvey,
  useProjects,
  useAddQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Textarea,
  Select,
  Loading,
  ErrorState,
} from '@/components/ui';
import { QuestionBuilder } from '@/features/surveys/components';
import type { Question, CreateQuestionData } from '@/types';

const surveySchema = z.object({
  title: z.string().min(5, 'عنوان الاستبيان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  type: z.enum(['pre_evaluation', 'post_evaluation', 'needs_assessment', 'satisfaction', 'feedback'], {
    required_error: 'يرجى اختيار نوع الاستبيان',
  }),
  project: z.string().min(1, 'يرجى اختيار المشروع'),
  startDate: z.string().min(1, 'تاريخ البدء مطلوب'),
  endDate: z.string().min(1, 'تاريخ الانتهاء مطلوب'),
  targetResponses: z.number().min(1, 'عدد الردود المستهدفة يجب أن يكون أكبر من صفر'),
  isAnonymous: z.boolean().default(false),
  allowMultipleResponses: z.boolean().default(false),
  welcomeMessage: z.string().optional(),
  thankYouMessage: z.string().optional(),
});

type SurveyFormData = z.infer<typeof surveySchema>;

const typeOptions = [
  { value: 'pre_evaluation', label: 'تقييم قبلي' },
  { value: 'post_evaluation', label: 'تقييم بعدي' },
  { value: 'needs_assessment', label: 'دراسة احتياج' },
  { value: 'satisfaction', label: 'رضا المستفيدين' },
  { value: 'feedback', label: 'تغذية راجعة' },
];

const statusOptions = [
  { value: 'draft', label: 'مسودة' },
  { value: 'active', label: 'نشط' },
  { value: 'closed', label: 'مغلق' },
  { value: 'archived', label: 'مؤرشف' },
];

export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<'info' | 'questions'>('info');

  const { data: survey, isLoading: surveyLoading, error: surveyError, refetch } = useSurvey(id);
  const { data: questions, isLoading: questionsLoading } = useSurveyQuestions(id);
  const { data: projectsData } = useProjects({ limit: 100 });
  const updateSurvey = useUpdateSurvey();
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const projectOptions = projectsData?.map((p) => ({
    value: p._id,
    label: p.name,
  })) || [];

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    values: survey ? {
      title: survey.title,
      description: survey.description,
      type: survey.type,
      project: typeof survey.project === 'object' ? survey.project._id : survey.project,
      startDate: formatDateForInput(survey.startDate),
      endDate: formatDateForInput(survey.endDate),
      targetResponses: survey.targetResponses,
      isAnonymous: survey.isAnonymous,
      allowMultipleResponses: survey.allowMultipleResponses,
      welcomeMessage: survey.welcomeMessage || '',
      thankYouMessage: survey.thankYouMessage || '',
    } : undefined,
  });

  const onSubmit = async (data: SurveyFormData) => {
    try {
      await updateSurvey.mutateAsync({
        id,
        data: {
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        },
      });
      router.push(`/surveys/${id}`);
    } catch {
      // Error handled by mutation
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'closed' | 'archived') => {
    try {
      await updateSurvey.mutateAsync({
        id,
        data: { status: newStatus },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddQuestion = async (questionData: CreateQuestionData) => {
    try {
      await addQuestion.mutateAsync({
        ...questionData,
        survey: id,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleUpdateQuestion = async (questionId: string, questionData: Partial<CreateQuestionData>) => {
    try {
      await updateQuestion.mutateAsync({
        id: questionId,
        data: questionData,
        surveyId: id,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      try {
        await deleteQuestion.mutateAsync({
          id: questionId,
          surveyId: id,
        });
      } catch {
        // Error handled by mutation
      }
    }
  };

  if (surveyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="جاري تحميل بيانات الاستبيان..." />
      </div>
    );
  }

  if (surveyError || !survey) {
    return <ErrorState error={surveyError} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title={`تعديل: ${survey.title}`}
        subtitle="تعديل بيانات الاستبيان وإدارة الأسئلة"
        backLink={`/surveys/${id}`}
        breadcrumbs={[
          { label: 'الاستبيانات', href: '/surveys' },
          { label: survey.title, href: `/surveys/${id}` },
          { label: 'تعديل' },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          المعلومات الأساسية
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'questions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700'
          }`}
        >
          الأسئلة ({questions?.length || 0})
        </button>
      </div>

      {activeTab === 'info' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader title="حالة الاستبيان" />
            <div className="flex items-center gap-4">
              <Select
                options={statusOptions}
                value={survey.status}
                onChange={(value) => handleStatusChange(value as 'draft' | 'active' | 'closed' | 'archived')}
                className="w-48"
              />
              <span className="text-sm text-secondary-500">
                تغيير الحالة سيؤثر على إمكانية تعبئة الاستبيان
              </span>
            </div>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader title="المعلومات الأساسية" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="عنوان الاستبيان"
                  placeholder="أدخل عنوان الاستبيان"
                  required
                  error={errors.title?.message}
                  {...register('title')}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="الوصف"
                  placeholder="أدخل وصفاً للاستبيان"
                  required
                  rows={3}
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>
              <Select
                label="نوع الاستبيان"
                options={typeOptions}
                value={watch('type')}
                onChange={(value) => setValue('type', value as SurveyFormData['type'])}
                required
                error={errors.type?.message}
              />
              <Select
                label="المشروع"
                options={projectOptions}
                value={watch('project')}
                onChange={(value) => setValue('project', value)}
                required
                placeholder="اختر المشروع"
                error={errors.project?.message}
              />
            </div>
          </Card>

          {/* Dates & Target */}
          <Card>
            <CardHeader title="التوقيت والأهداف" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="تاريخ البدء"
                type="date"
                required
                error={errors.startDate?.message}
                {...register('startDate')}
              />
              <Input
                label="تاريخ الانتهاء"
                type="date"
                required
                error={errors.endDate?.message}
                {...register('endDate')}
              />
              <Input
                label="عدد الردود المستهدفة"
                type="number"
                required
                error={errors.targetResponses?.message}
                {...register('targetResponses', { valueAsNumber: true })}
              />
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader title="الإعدادات" />
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  {...register('isAnonymous')}
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isAnonymous" className="text-secondary-700">
                  استبيان مجهول الهوية
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowMultipleResponses"
                  {...register('allowMultipleResponses')}
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="allowMultipleResponses" className="text-secondary-700">
                  السماح بردود متعددة من نفس المستخدم
                </label>
              </div>
            </div>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader title="الرسائل" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea
                label="رسالة الترحيب"
                placeholder="رسالة تظهر في بداية الاستبيان..."
                rows={3}
                {...register('welcomeMessage')}
              />
              <Textarea
                label="رسالة الشكر"
                placeholder="رسالة تظهر بعد إكمال الاستبيان..."
                rows={3}
                {...register('thankYouMessage')}
              />
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="submit" isLoading={updateSurvey.isPending}>
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <Card>
          <CardHeader
            title="أسئلة الاستبيان"
            subtitle="أضف وعدّل أسئلة الاستبيان"
          />
          {questionsLoading ? (
            <Loading text="جاري تحميل الأسئلة..." />
          ) : (
            <QuestionBuilder
              surveyId={id}
              questions={questions || []}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestions={() => {}}
              isLoading={addQuestion.isPending || updateQuestion.isPending || deleteQuestion.isPending}
            />
          )}
        </Card>
      )}
    </div>
  );
}
