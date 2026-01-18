'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProject, useProjectStatistics } from '@/hooks';
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
  StatsCard,
} from '@/components/ui';
import { LineChart, DonutChart } from '@/components/charts';
import { formatDate, formatCurrency, getProjectTypeLabel } from '@/lib/utils';
import {
  PencilSquareIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: project, isLoading, error, refetch } = useProject(id);
  const { data: statistics } = useProjectStatistics(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading text="جاري تحميل بيانات المشروع..." />
      </div>
    );
  }

  if (error || !project) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Mock data for charts
  const impactTrendData = [
    { month: 'يناير', score: 65 },
    { month: 'فبراير', score: 68 },
    { month: 'مارس', score: 72 },
    { month: 'أبريل', score: 75 },
    { month: 'مايو', score: 78 },
  ];

  const budgetData = [
    { name: 'تم صرفه', value: project.budget.spent, color: '#0ea5e9' },
    { name: 'المتبقي', value: project.budget.total - project.budget.spent, color: '#e2e8f0' },
  ];

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={project.description}
        backLink="/projects"
        breadcrumbs={[
          { label: 'المشاريع', href: '/projects' },
          { label: project.name },
        ]}
        actions={
          <Link href={`/projects/${id}/edit`}>
            <Button leftIcon={<PencilSquareIcon className="h-5 w-5" />}>
              تعديل المشروع
            </Button>
          </Link>
        }
      />

      {/* Status & Type */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatusBadge status={project.status} size="lg" />
        <Badge variant="info" size="lg">
          {getProjectTypeLabel(project.type)}
        </Badge>
        {project.tags?.map((tag) => (
          <Badge key={tag} variant="default" size="lg">
            {tag}
          </Badge>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="المستفيدون"
          value={statistics?.totalBeneficiaries || 0}
          icon={<UserGroupIcon className="h-6 w-6 text-primary-600" />}
          iconBgColor="bg-primary-100"
        />
        <StatsCard
          title="الأنشطة"
          value={statistics?.totalActivities || 0}
          icon={<CalendarDaysIcon className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="الاستبيانات"
          value={statistics?.totalSurveys || 0}
          icon={<ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatsCard
          title="درجة الأثر"
          value={`${statistics?.impactScore || 0}%`}
          icon={<ChartBarIcon className="h-6 w-6 text-success-600" />}
          iconBgColor="bg-success-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Info */}
        <Card className="lg:col-span-2">
          <CardHeader title="معلومات المشروع" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-500">تاريخ البدء</p>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-500">تاريخ الانتهاء</p>
                  <p className="font-medium">{formatDate(project.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-500">الموقع</p>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-500">الميزانية</p>
                  <p className="font-medium">
                    {formatCurrency(project.budget.total, project.budget.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-5 w-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-500">الفئات المستهدفة</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.targetGroups.map((group, index) => (
                      <Badge key={index} variant="default" size="sm">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary-700">نسبة الإنجاز</span>
              <span className="text-sm font-medium text-primary-600">
                {statistics?.completionRate || 0}%
              </span>
            </div>
            <ProgressBar value={statistics?.completionRate || 0} variant="primary" size="md" />
          </div>
        </Card>

        {/* Budget Chart */}
        <Card>
          <CardHeader title="استخدام الميزانية" />
          <DonutChart
            data={budgetData}
            centerValue={`${Math.round((project.budget.spent / project.budget.total) * 100)}%`}
            centerLabel="مصروف"
            height={200}
            outerRadius={80}
            showLegend={true}
          />
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">المصروف</span>
              <span className="font-medium">
                {formatCurrency(project.budget.spent, project.budget.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-secondary-500">المتبقي</span>
              <span className="font-medium">
                {formatCurrency(project.budget.total - project.budget.spent, project.budget.currency)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals & Impact Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Goals */}
        <Card>
          <CardHeader title="الأهداف" />
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-secondary-500 mb-3">الأهداف قصيرة المدى</h4>
              <ul className="space-y-2">
                {project.goals.short_term.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-secondary-700">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-secondary-500 mb-3">الأهداف طويلة المدى</h4>
              <ul className="space-y-2">
                {project.goals.long_term.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-success-50 text-success-600 text-sm flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-secondary-700">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Impact Trend */}
        <Card>
          <CardHeader title="اتجاه الأثر" subtitle="درجة الأثر عبر الزمن" />
          <LineChart
            data={impactTrendData}
            xKey="month"
            lines={[{ dataKey: 'score', name: 'درجة الأثر', color: '#0ea5e9' }]}
            height={250}
          />
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader title="إجراءات سريعة" />
        <div className="flex flex-wrap gap-3">
          <Link href={`/surveys?project=${id}`}>
            <Button variant="outline">عرض الاستبيانات</Button>
          </Link>
          <Link href={`/surveys/new?project=${id}`}>
            <Button variant="outline">إنشاء استبيان</Button>
          </Link>
          <Link href={`/analysis?project=${id}`}>
            <Button variant="outline">عرض التحليلات</Button>
          </Link>
          <Link href={`/reports?project=${id}`}>
            <Button variant="outline">إنشاء تقرير</Button>
          </Link>
        </div>
      </Card> */}
    </div>
  );
}
