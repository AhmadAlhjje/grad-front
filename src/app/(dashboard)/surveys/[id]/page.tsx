'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSurvey, useSurveyQuestions, useDeleteSurvey, useUpdateSurvey } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  StatusBadge,
  Loading,
  ErrorState,
  ProgressBar,
} from '@/components/ui';
import { formatDate, getSurveyTypeLabel } from '@/lib/utils';
import {
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import type { Question, Project } from '@/types';

const questionTypeLabels: Record<string, string> = {
  rating: 'تقييم',
  multiple_choice: 'اختيار متعدد',
  single_choice: 'اختيار واحد',
  textarea: 'نص طويل',
  text: 'نص قصير',
  scale: 'مقياس',
  yes_no: 'نعم/لا',
  date: 'تاريخ',
  number: 'رقم',
};

export default function SurveyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: survey, isLoading, error, refetch } = useSurvey(id);
  const { data: questions } = useSurveyQuestions(id);
  const deleteSurvey = useDeleteSurvey();
  const updateSurvey = useUpdateSurvey();

  const handleDelete = async () => {
    if (confirm('هل أنت متأكد من حذف هذا الاستبيان؟')) {
      try {
        await deleteSurvey.mutateAsync(id);
        router.push('/surveys');
      } catch {
        // Error handled by mutation
      }
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

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/surveys/${id}/fill`;
    navigator.clipboard.writeText(shareUrl);
    alert('تم نسخ رابط الاستبيان');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="جاري تحميل بيانات الاستبيان..." />
      </div>
    );
  }

  if (error || !survey) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const projectName = typeof survey.project === 'object'
    ? (survey.project as Project).name
    : 'غير محدد';

  const responseProgress = survey.targetResponses > 0
    ? (survey.currentResponses / survey.targetResponses) * 100
    : 0;

  return (
    <div>
      <PageHeader
        title={survey.title}
        subtitle={survey.description}
        backLink="/surveys"
        breadcrumbs={[
          { label: 'الاستبيانات', href: '/surveys' },
          { label: survey.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {survey.status === 'draft' && (
              <Button
                variant="success"
                leftIcon={<PlayIcon className="h-5 w-5" />}
                onClick={() => handleStatusChange('active')}
                isLoading={updateSurvey.isPending}
              >
                تفعيل
              </Button>
            )}
            {survey.status === 'active' && (
              <Button
                variant="warning"
                leftIcon={<PauseIcon className="h-5 w-5" />}
                onClick={() => handleStatusChange('closed')}
                isLoading={updateSurvey.isPending}
              >
                إغلاق
              </Button>
            )}
            <Button
              variant="outline"
              leftIcon={<ShareIcon className="h-5 w-5" />}
              onClick={copyShareLink}
            >
              مشاركة
            </Button>
            <Link href={`/surveys/${id}/analytics`}>
              <Button variant="outline" leftIcon={<ChartBarIcon className="h-5 w-5" />}>
                التحليلات
              </Button>
            </Link>
            <Link href={`/surveys/${id}/edit`}>
              <Button variant="outline" leftIcon={<PencilSquareIcon className="h-5 w-5" />}>
                تعديل
              </Button>
            </Link>
            <Button
              variant="danger"
              leftIcon={<TrashIcon className="h-5 w-5" />}
              onClick={handleDelete}
              isLoading={deleteSurvey.isPending}
            >
              حذف
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader title="المعلومات الأساسية" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">النوع</p>
                <Badge variant="info" className="mt-1">
                  {getSurveyTypeLabel(survey.type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-secondary-500">الحالة</p>
                <div className="mt-1">
                  <StatusBadge status={survey.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-secondary-500">المشروع</p>
                <p className="font-medium text-secondary-900 mt-1">{projectName}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">تاريخ الإنشاء</p>
                <p className="font-medium text-secondary-900 mt-1">
                  {formatDate(survey.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">تاريخ البدء</p>
                <p className="font-medium text-secondary-900 mt-1">
                  {formatDate(survey.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">تاريخ الانتهاء</p>
                <p className="font-medium text-secondary-900 mt-1">
                  {formatDate(survey.endDate)}
                </p>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader
              title="الأسئلة"
              subtitle={`${questions?.length || 0} سؤال`}
              action={
                <Link href={`/surveys/${id}/edit`}>
                  <Button variant="outline" size="sm">
                    إدارة الأسئلة
                  </Button>
                </Link>
              }
            />
            {questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question: Question, index: number) => (
                  <div
                    key={question._id}
                    className="p-4 border border-secondary-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-secondary-900">
                            {question.questionText}
                            {question.isRequired && (
                              <span className="text-danger-500 mr-1">*</span>
                            )}
                          </p>
                          {question.description && (
                            <p className="text-sm text-secondary-500 mt-1">
                              {question.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {questionTypeLabels[question.type] || question.type}
                      </Badge>
                    </div>
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 mr-11">
                        <p className="text-sm text-secondary-500 mb-2">الخيارات:</p>
                        <ul className="list-disc list-inside text-sm text-secondary-700 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
                <p>لا توجد أسئلة بعد</p>
                <Link href={`/surveys/${id}/edit`}>
                  <Button variant="outline" size="sm" className="mt-3">
                    إضافة أسئلة
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Response Progress */}
          <Card>
            <CardHeader title="تقدم الردود" />
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">
                {survey.currentResponses}
              </p>
              <p className="text-secondary-500">
                من أصل {survey.targetResponses} رد مستهدف
              </p>
              <div className="mt-4">
                <ProgressBar
                  value={survey.currentResponses}
                  max={survey.targetResponses}
                  size="lg"
                  variant={responseProgress >= 100 ? 'success' : 'primary'}
                  showLabel
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <Link href={`/surveys/${id}/fill`}>
                <Button variant="primary" className="w-full">
                  <DocumentDuplicateIcon className="h-5 w-5 ml-2" />
                  معاينة الاستبيان
                </Button>
              </Link>
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader title="الإعدادات" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">استبيان مجهول</span>
                <Badge variant={survey.isAnonymous ? 'success' : 'secondary'}>
                  {survey.isAnonymous ? 'نعم' : 'لا'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">ردود متعددة</span>
                <Badge variant={survey.allowMultipleResponses ? 'success' : 'secondary'}>
                  {survey.allowMultipleResponses ? 'مسموح' : 'غير مسموح'}
                </Badge>
              </div>
              {survey.settings && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">شريط التقدم</span>
                    <Badge variant={survey.settings.showProgressBar ? 'success' : 'secondary'}>
                      {survey.settings.showProgressBar ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">ترتيب عشوائي</span>
                    <Badge variant={survey.settings.randomizeQuestions ? 'success' : 'secondary'}>
                      {survey.settings.randomizeQuestions ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Messages */}
          {(survey.welcomeMessage || survey.thankYouMessage) && (
            <Card>
              <CardHeader title="الرسائل" />
              <div className="space-y-4">
                {survey.welcomeMessage && (
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">رسالة الترحيب</p>
                    <p className="text-secondary-700 bg-secondary-50 p-3 rounded-lg">
                      {survey.welcomeMessage}
                    </p>
                  </div>
                )}
                {survey.thankYouMessage && (
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">رسالة الشكر</p>
                    <p className="text-secondary-700 bg-secondary-50 p-3 rounded-lg">
                      {survey.thankYouMessage}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Tags */}
          {survey.tags && survey.tags.length > 0 && (
            <Card>
              <CardHeader title="الوسوم" />
              <div className="flex flex-wrap gap-2">
                {survey.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
