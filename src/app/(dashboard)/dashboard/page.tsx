'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, StatsCard, ProgressBar, LoadingSpinner } from '@/components/ui';
import { DonutChart } from '@/components/charts';
import { projectsApi, dashboardApi } from '@/api';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  // Fetch all projects for charts
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsApi.getAll(),
  });

  const isLoading = statsLoading || projectsLoading;

  // Calculate project status distribution
  const projectsList = projects || [];
  const activeProjects = projectsList.filter((p) => p.status === 'active').length;
  const completedProjects = projectsList.filter((p) => p.status === 'completed').length;
  const draftProjects = projectsList.filter((p) => p.status === 'draft').length;
  const archivedProjects = projectsList.filter((p) => p.status === 'archived').length;

  // Projects status for donut chart
  const projectsStatusData = [
    { name: 'مكتملة', value: completedProjects, color: '#22c55e' },
    { name: 'نشطة', value: activeProjects, color: '#0ea5e9' },
    { name: 'مؤرشفة', value: archivedProjects, color: '#f59e0b' },
    { name: 'مسودة', value: draftProjects, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  // Recent projects (latest 4)
  const recentProjects = projectsList.slice(0, 4).map((project) => ({
    id: project._id,
    name: project.name,
    status: project.status,
    progress: project.status === 'completed' ? 100 :
      project.status === 'active' ? 60 :
        project.status === 'draft' ? 20 :
          project.status === 'archived' ? 100 : 45,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة عامة على أداء المشاريع والمبادرات"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatsCard
          title="إجمالي المشاريع"
          value={stats?.totalProjects || 0}
          icon={<FolderIcon className="h-6 w-6 text-primary-600" />}
          iconBgColor="bg-primary-100"
        />
        <StatsCard
          title="المشاريع النشطة"
          value={stats?.activeProjects || 0}
          icon={<CheckCircleIcon className="h-6 w-6 text-success-600" />}
          iconBgColor="bg-success-50"
        />
        <StatsCard
          title="المشاريع المكتملة"
          value={stats?.completedProjects || 0}
          icon={<FolderIcon className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="المستفيدون"
          value={stats?.totalBeneficiaries || 0}
          icon={<UserGroupIcon className="h-6 w-6 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatsCard
          title="الاستبيانات"
          value={stats?.totalSurveys || 0}
          icon={<ClipboardDocumentListIcon className="h-6 w-6 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
        <StatsCard
          title="نسبة الإنجاز"
          value={`${stats?.completionRate || 0}%`}
          icon={<ChartBarIcon className="h-6 w-6 text-orange-600" />}
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Projects Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader
            title="حالة المشاريع"
            subtitle="توزيع المشاريع حسب الحالة"
          />
          {projectsStatusData.length > 0 ? (
            <DonutChart
              data={projectsStatusData}
              centerValue={stats?.totalProjects || 0}
              centerLabel="مشروع"
              height={280}
              outerRadius={100}
            />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-secondary-400">
              لا توجد بيانات
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="الإحصائيات العامة"
            subtitle="ملخص البيانات الرئيسية"
          />
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="text-sm text-secondary-600">إجمالي الاستبيانات</p>
                <p className="text-2xl font-bold text-secondary-900">{stats?.totalSurveys || 0}</p>
              </div>
              <ClipboardDocumentListIcon className="h-10 w-10 text-primary-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="text-sm text-secondary-600">إجمالي الإجابات</p>
                <p className="text-2xl font-bold text-secondary-900">{stats?.totalResponses || 0}</p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-success-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="text-sm text-secondary-600">المستفيدون</p>
                <p className="text-2xl font-bold text-secondary-900">{stats?.totalBeneficiaries || 0}</p>
              </div>
              <UserGroupIcon className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader
          title="أحدث المشاريع"
          subtitle="المشاريع الأخيرة ونسب الإنجاز"
          action={
            <a
              href="/projects"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              عرض الكل
            </a>
          }
        />
        {recentProjects.length > 0 ? (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900">{project.name}</h4>
                  <div className="mt-2">
                    <ProgressBar
                      value={project.progress}
                      size="sm"
                      variant={project.status === 'completed' ? 'success' : 'primary'}
                      showLabel
                    />
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === 'active'
                    ? 'bg-success-50 text-success-700'
                    : project.status === 'completed'
                      ? 'bg-primary-50 text-primary-700'
                      : project.status === 'archived'
                        ? 'bg-warning-50 text-warning-700'
                        : 'bg-secondary-100 text-secondary-700'
                    }`}
                >
                  {project.status === 'active'
                    ? 'نشط'
                    : project.status === 'completed'
                      ? 'مكتمل'
                      : project.status === 'archived'
                        ? 'مؤرشف'
                        : 'مسودة'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-400">
            لا توجد مشاريع حالياً
          </div>
        )}
      </Card>
    </div>
  );
}
