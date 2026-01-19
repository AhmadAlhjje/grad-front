'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSurvey, useSurveyAnalytics } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Loading,
  ErrorState,
  ProgressBar,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

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

export default function SurveyAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: survey, isLoading: surveyLoading, error: surveyError, refetch } = useSurvey(id);
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useSurveyAnalytics(id);

  const isLoading = surveyLoading || analyticsLoading;
  const error = surveyError || analyticsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="جاري تحميل التحليلات..." />
      </div>
    );
  }

  if (error || !survey) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0 دقيقة';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs} ثانية`;
    return `${minutes} دقيقة ${secs > 0 ? `و ${secs} ثانية` : ''}`;
  };

  return (
    <div>
      <PageHeader
        title={`تحليلات: ${survey.title}`}
        subtitle="عرض إحصائيات وتحليلات الاستبيان"
        backLink={`/surveys/${id}`}
        breadcrumbs={[
          { label: 'الاستبيانات', href: '/surveys' },
          { label: survey.title, href: `/surveys/${id}` },
          { label: 'التحليلات' },
        ]}
        actions={
          <Button variant="outline" leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}>
            تصدير التقرير
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">إجمالي الردود</p>
              <p className="text-2xl font-bold text-secondary-900">
                {analytics?.totalResponses || survey.currentResponses || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">نسبة الإكمال</p>
              <p className="text-2xl font-bold text-secondary-900">
                {analytics?.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">متوسط وقت الإكمال</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatTime(analytics?.averageCompletionTime || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-info-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-info-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-500">التقدم نحو الهدف</p>
              <p className="text-2xl font-bold text-secondary-900">
                {survey.targetResponses > 0
                  ? Math.round(((analytics?.totalResponses || survey.currentResponses || 0) / survey.targetResponses) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Progress */}
          <Card>
            <CardHeader title="تقدم الردود" />
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-secondary-600">الردود الحالية</span>
                <span className="font-medium">
                  {analytics?.totalResponses || survey.currentResponses || 0} / {survey.targetResponses}
                </span>
              </div>
              <ProgressBar
                value={analytics?.totalResponses || survey.currentResponses || 0}
                max={survey.targetResponses}
                size="lg"
                variant="primary"
              />
            </div>
          </Card>

          {/* Responses Over Time */}
          {analytics?.responsesByDate && analytics.responsesByDate.length > 0 && (
            <Card>
              <CardHeader title="الردود عبر الزمن" />
              <div className="space-y-3">
                {analytics.responsesByDate.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-secondary-600">{formatDate(item.date)}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <ProgressBar
                          value={item.count}
                          max={Math.max(...analytics.responsesByDate.map(r => r.count))}
                          size="sm"
                          variant="info"
                        />
                      </div>
                      <span className="font-medium w-8 text-left">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Question Analytics */}
          {analytics?.questionAnalytics && analytics.questionAnalytics.length > 0 && (
            <Card>
              <CardHeader title="تحليل الأسئلة" />
              <div className="space-y-6">
                {analytics.questionAnalytics.map((qa, index) => (
                  <div key={qa.questionId} className="border-b border-secondary-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-secondary-900">{qa.questionText}</p>
                          <p className="text-sm text-secondary-500">
                            {qa.totalAnswers} إجابة
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {questionTypeLabels[qa.type] || qa.type}
                      </Badge>
                    </div>

                    {/* Distribution for choice questions */}
                    {qa.distribution && qa.distribution.length > 0 && (
                      <div className="mr-11 space-y-2">
                        {qa.distribution.map((dist, distIndex) => (
                          <div key={distIndex} className="flex items-center gap-3">
                            <span className="text-sm text-secondary-600 w-32 truncate">
                              {dist.value}
                            </span>
                            <div className="flex-1">
                              <ProgressBar
                                value={dist.percentage}
                                max={100}
                                size="sm"
                                variant="primary"
                              />
                            </div>
                            <span className="text-sm font-medium w-16 text-left">
                              {dist.count} ({dist.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Average for numeric questions */}
                    {qa.average !== undefined && (
                      <div className="mr-11 flex items-center gap-4">
                        <div className="bg-secondary-100 rounded-lg px-4 py-2">
                          <span className="text-sm text-secondary-500">المتوسط: </span>
                          <span className="font-bold text-secondary-900">{qa.average.toFixed(2)}</span>
                        </div>
                        {qa.median !== undefined && (
                          <div className="bg-secondary-100 rounded-lg px-4 py-2">
                            <span className="text-sm text-secondary-500">الوسيط: </span>
                            <span className="font-bold text-secondary-900">{qa.median.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Analytics Data */}
          {(!analytics || !analytics.questionAnalytics || analytics.questionAnalytics.length === 0) && (
            <Card>
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">لا توجد بيانات كافية</h3>
                <p className="text-secondary-500 mb-4">
                  لم يتم جمع ردود كافية بعد لعرض التحليلات
                </p>
                <Link href={`/surveys/${id}`}>
                  <Button variant="outline">العودة للاستبيان</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Survey Info */}
          <Card>
            <CardHeader title="معلومات الاستبيان" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">الحالة</span>
                <Badge
                  variant={
                    survey.status === 'active'
                      ? 'success'
                      : survey.status === 'closed'
                      ? 'warning'
                      : 'secondary'
                  }
                >
                  {survey.status === 'draft'
                    ? 'مسودة'
                    : survey.status === 'active'
                    ? 'نشط'
                    : survey.status === 'closed'
                    ? 'مغلق'
                    : 'مؤرشف'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">تاريخ البدء</span>
                <span className="font-medium">{formatDate(survey.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">تاريخ الانتهاء</span>
                <span className="font-medium">{formatDate(survey.endDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">الهدف</span>
                <span className="font-medium">{survey.targetResponses} رد</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="إجراءات سريعة" />
            <div className="space-y-3">
              <Link href={`/surveys/${id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  عرض الاستبيان
                </Button>
              </Link>
              <Link href={`/surveys/${id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  تعديل الاستبيان
                </Button>
              </Link>
              <Link href={`/surveys/${id}/fill`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  معاينة الاستبيان
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
