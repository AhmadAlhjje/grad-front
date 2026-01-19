'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSurvey, useSurveyQuestions, useSubmitResponse, useSaveDraft } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { Card, Loading, ErrorState } from '@/components/ui';
import { SurveyFillForm } from '@/features/surveys/components/survey-fill-form';
import type { Answer } from '@/types';

export default function SurveyFillPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: survey, isLoading: surveyLoading, error: surveyError } = useSurvey(id);
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useSurveyQuestions(id);
  const submitResponse = useSubmitResponse();
  const saveDraft = useSaveDraft();

  const isLoading = surveyLoading || questionsLoading;
  const error = surveyError || questionsError;

  const handleSubmit = async (answers: Answer[]) => {
    try {
      await submitResponse.mutateAsync({
        survey: id,
        answers,
        language: 'ar',
        metadata: {
          deviceType: 'web',
          browser: navigator.userAgent,
        },
      });
      router.push(`/surveys/${id}/thank-you`);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveDraft = async (answers: Answer[]) => {
    try {
      await saveDraft.mutateAsync({
        survey: id,
        answers,
        language: 'ar',
      });
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading text="جاري تحميل الاستبيان..." />
      </div>
    );
  }

  if (error || !survey || !questions) {
    return <ErrorState />;
  }

  if (survey.status !== 'active') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold text-secondary-900 mb-2">الاستبيان غير متاح</h2>
          <p className="text-secondary-500">هذا الاستبيان غير متاح حالياً للتعبئة.</p>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <h2 className="text-xl font-bold text-secondary-900 mb-2">لا توجد أسئلة</h2>
          <p className="text-secondary-500">هذا الاستبيان لا يحتوي على أسئلة.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={survey.title}
        subtitle={survey.description}
        backLink="/surveys"
      />

      {survey.welcomeMessage && (
        <Card className="mb-6 max-w-2xl mx-auto bg-primary-50 border-primary-200">
          <p className="text-primary-800">{survey.welcomeMessage}</p>
        </Card>
      )}

      <SurveyFillForm
        survey={survey}
        questions={questions}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isSubmitting={submitResponse.isPending}
        isSaving={saveDraft.isPending}
      />
    </div>
  );
}
