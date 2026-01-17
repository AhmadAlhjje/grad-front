'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSurvey, useProjects, useAddQuestion } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardFooter, Button, Input, Textarea, Select, Loading } from '@/components/ui';
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

function NewSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');

  const [step, setStep] = useState(1);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);

  const { data: projectsData } = useProjects({ limit: 100 });
  const createSurvey = useCreateSurvey();
  const addQuestion = useAddQuestion();

  const projectOptions = projectsData?.data?.map((p) => ({
    value: p._id,
    label: p.name,
  })) || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'pre_evaluation',
      project: projectIdFromUrl || '',
      startDate: '',
      endDate: '',
      targetResponses: 100,
      isAnonymous: false,
      allowMultipleResponses: false,
      welcomeMessage: '',
      thankYouMessage: 'شكراً لإكمالك الاستبيان!',
    },
  });

  const onSubmitBasicInfo = async (data: SurveyFormData) => {
    try {
      const survey = await createSurvey.mutateAsync({
        ...data,
        tags: [],
        settings: {
          showProgressBar: true,
          randomizeQuestions: false,
          requiredCompletion: true,
          language: 'ar',
        },
      });
      setSurveyId(survey._id);
      setStep(2);
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddQuestion = async (questionData: CreateQuestionData) => {
    if (!surveyId) return;

    try {
      const question = await addQuestion.mutateAsync({
        ...questionData,
        survey: surveyId,
      });
      setLocalQuestions([...localQuestions, question]);
    } catch {
      // Error handled by mutation
    }
  };

  const handleFinish = () => {
    router.push(`/surveys/${surveyId}`);
  };

  return (
    <div>
      <PageHeader
        title="إنشاء استبيان جديد"
        subtitle={step === 1 ? 'أدخل المعلومات الأساسية' : 'أضف أسئلة الاستبيان'}
        backLink="/surveys"
        breadcrumbs={[
          { label: 'الاستبيانات', href: '/surveys' },
          { label: 'إنشاء استبيان جديد' },
        ]}
      />

      {/* Steps Indicator */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            step === 1 ? 'bg-primary-100 text-primary-700' : 'bg-success-50 text-success-700'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-medium">
            1
          </span>
          <span className="font-medium">المعلومات الأساسية</span>
        </div>
        <div className="h-px w-8 bg-secondary-300" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            step === 2 ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-500'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-medium">
            2
          </span>
          <span className="font-medium">الأسئلة</span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmit(onSubmitBasicInfo)} className="space-y-6">
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
              <Button type="submit" isLoading={createSurvey.isPending}>
                التالي: إضافة الأسئلة
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="أسئلة الاستبيان"
              subtitle="أضف الأسئلة التي تريد طرحها على المستفيدين"
            />
            <QuestionBuilder
              surveyId={surveyId!}
              questions={localQuestions}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={() => {}}
              onDeleteQuestion={() => {}}
              onReorderQuestions={() => {}}
              isLoading={addQuestion.isPending}
            />
          </Card>

          <Card>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                السابق
              </Button>
              <Button onClick={handleFinish} disabled={localQuestions.length === 0}>
                إنهاء وحفظ الاستبيان
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function NewSurveyPage() {
  return (
    <Suspense fallback={<Loading text="جاري التحميل..." />}>
      <NewSurveyContent />
    </Suspense>
  );
}
