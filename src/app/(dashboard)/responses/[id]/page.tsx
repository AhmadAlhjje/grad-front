'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResponse, useDeleteResponse } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Loading,
  ErrorState,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  TrashIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Survey, Question } from '@/types';

const statusConfig = {
  completed: { label: 'مكتمل', variant: 'success' as const },
  submitted: { label: 'مكتمل', variant: 'success' as const },
  draft: { label: 'مسودة', variant: 'default' as const },
  partial: { label: 'جزئي', variant: 'warning' as const },
};

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

export default function ResponseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: response, isLoading, error, refetch } = useResponse(id);
  const deleteResponse = useDeleteResponse();

  const handleDelete = async () => {
    if (!response) return;

    if (confirm('هل أنت متأكد من حذف هذا الرد؟')) {
      try {
        const surveyId = typeof response.survey === 'object'
          ? (response.survey as Survey)._id
          : response.survey;

        await deleteResponse.mutateAsync({ id, surveyId });
        router.push('/responses');
      } catch {
        // Error handled by mutation
      }
    }
  };

  const formatTime = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return '-';
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.round((end - start) / 1000 / 60);
    if (diff < 1) return 'أقل من دقيقة';
    return `${diff} دقيقة`;
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType === 'mobile') {
      return <DevicePhoneMobileIcon className="h-5 w-5" />;
    }
    return <ComputerDesktopIcon className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="جاري تحميل بيانات الرد..." />
      </div>
    );
  }

  if (error || !response) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const survey = typeof response.survey === 'object' ? response.survey as Survey : null;
  const surveyTitle = survey?.title || 'غير معروف';
  const surveyId = survey?._id || (typeof response.survey === 'string' ? response.survey : '');

  return (
    <div>
      <PageHeader
        title="تفاصيل الرد"
        subtitle={`رد على استبيان: ${surveyTitle}`}
        backLink="/responses"
        breadcrumbs={[
          { label: 'الردود', href: '/responses' },
          { label: 'تفاصيل الرد' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {surveyId && (
              <Link href={`/surveys/${surveyId}`}>
                <Button variant="outline" leftIcon={<ArrowLeftIcon className="h-5 w-5" />}>
                  عرض الاستبيان
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              leftIcon={<TrashIcon className="h-5 w-5" />}
              onClick={handleDelete}
              isLoading={deleteResponse.isPending}
            >
              حذف
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Info */}
          <Card>
            <CardHeader title="معلومات الرد" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-success-500" />
                <p className="text-2xl font-bold text-secondary-900">
                  {response.completionPercentage || 0}%
                </p>
                <p className="text-sm text-secondary-500">نسبة الإكمال</p>
              </div>
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <ClockIcon className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                <p className="text-2xl font-bold text-secondary-900">
                  {formatTime(response.startedAt, response.completedAt)}
                </p>
                <p className="text-sm text-secondary-500">وقت الإكمال</p>
              </div>
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                {getDeviceIcon(response.metadata?.deviceType)}
                <p className="text-lg font-bold text-secondary-900 mt-2">
                  {response.metadata?.deviceType === 'mobile' ? 'موبايل' : 'ويب'}
                </p>
                <p className="text-sm text-secondary-500">نوع الجهاز</p>
              </div>
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <Badge
                  variant={statusConfig[response.status as keyof typeof statusConfig]?.variant || 'default'}
                  className="mb-2"
                >
                  {statusConfig[response.status as keyof typeof statusConfig]?.label || response.status}
                </Badge>
                <p className="text-sm text-secondary-500">الحالة</p>
              </div>
            </div>
          </Card>

          {/* Answers */}
          <Card>
            <CardHeader
              title="الإجابات"
              subtitle={`${response.answers?.length || 0} إجابة`}
            />
            {response.answers && response.answers.length > 0 ? (
              <div className="space-y-4">
                {response.answers.map((answer, index) => (
                  <div
                    key={answer.question || index}
                    className="p-4 border border-secondary-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-secondary-900">
                            السؤال #{index + 1}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {questionTypeLabels[answer.valueType] || answer.valueType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mr-11 mt-3 p-3 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-500 mb-1">الإجابة:</p>
                      <p className="text-secondary-900 font-medium">
                        {answer.textValue ||
                         answer.numberValue?.toString() ||
                         (answer.booleanValue !== undefined ? (answer.booleanValue ? 'نعم' : 'لا') : '') ||
                         answer.arrayValue?.join(', ') ||
                         '-'}
                      </p>
                    </div>
                    {answer.timeSpent && (
                      <p className="mr-11 mt-2 text-xs text-secondary-400">
                        وقت الإجابة: {Math.round(answer.timeSpent / 60)} دقيقة
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
                <p>لا توجد إجابات مسجلة</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Survey Info */}
          {survey && (
            <Card>
              <CardHeader title="معلومات الاستبيان" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-secondary-500">العنوان</p>
                  <p className="font-medium text-secondary-900">{survey.title}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">النوع</p>
                  <Badge variant="info">
                    {survey.type === 'pre_evaluation' ? 'تقييم قبلي' :
                     survey.type === 'post_evaluation' ? 'تقييم بعدي' :
                     survey.type === 'needs_assessment' ? 'دراسة احتياج' :
                     survey.type === 'satisfaction' ? 'رضا المستفيدين' :
                     survey.type === 'feedback' ? 'تغذية راجعة' : survey.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">حالة الاستبيان</p>
                  <Badge variant={survey.status === 'active' ? 'success' : 'secondary'}>
                    {survey.status === 'draft' ? 'مسودة' :
                     survey.status === 'active' ? 'نشط' :
                     survey.status === 'closed' ? 'مغلق' :
                     survey.status === 'archived' ? 'مؤرشف' : survey.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader title="التوقيت" />
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary-500">تاريخ البدء</p>
                <p className="font-medium text-secondary-900">
                  {response.startedAt ? formatDate(response.startedAt) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">تاريخ الإكمال</p>
                <p className="font-medium text-secondary-900">
                  {response.completedAt ? formatDate(response.completedAt) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">تاريخ الإنشاء</p>
                <p className="font-medium text-secondary-900">
                  {formatDate(response.createdAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          {response.metadata && (
            <Card>
              <CardHeader title="معلومات تقنية" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-secondary-500">نوع الجهاز</p>
                  <p className="font-medium text-secondary-900">
                    {response.metadata.deviceType || '-'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
