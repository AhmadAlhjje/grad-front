'use client';

import { PageHeader } from '@/components/layout';
import { Card, CardHeader, StatsCard, ProgressBar } from '@/components/ui';
import { LineChart, BarChart, DonutChart, RadarChart } from '@/components/charts';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Mock data for dashboard
const kpiData = {
  totalProjects: 24,
  activeProjects: 8,
  totalBeneficiaries: 1250,
  totalSurveys: 45,
  averageImpactScore: 78,
  completionRate: 65,
};

const impactTrendData = [
  { month: 'يناير', impact: 65, target: 70 },
  { month: 'فبراير', impact: 68, target: 70 },
  { month: 'مارس', impact: 72, target: 75 },
  { month: 'أبريل', impact: 75, target: 75 },
  { month: 'مايو', impact: 78, target: 80 },
  { month: 'يونيو', impact: 82, target: 80 },
];

const projectsStatusData = [
  { name: 'مكتملة', value: 12, color: '#22c55e' },
  { name: 'نشطة', value: 8, color: '#0ea5e9' },
  { name: 'معلقة', value: 2, color: '#f59e0b' },
  { name: 'مسودة', value: 2, color: '#94a3b8' },
];

const prePostComparisonData = [
  { name: 'المعرفة', pre: 2.8, post: 4.3 },
  { name: 'المهارات', pre: 2.5, post: 4.1 },
  { name: 'الثقة', pre: 2.3, post: 4.2 },
  { name: 'التطبيق', pre: 2.0, post: 3.8 },
];

const impactDimensionsData = [
  { dimension: 'اقتصادي', current: 75, target: 80 },
  { dimension: 'اجتماعي', current: 82, target: 85 },
  { dimension: 'تعليمي', current: 88, target: 90 },
  { dimension: 'صحي', current: 70, target: 75 },
  { dimension: 'بيئي', current: 65, target: 70 },
];

const recentProjects = [
  { id: '1', name: 'مبادرة تمكين الشباب', status: 'active', progress: 75 },
  { id: '2', name: 'برنامج التدريب المهني', status: 'active', progress: 60 },
  { id: '3', name: 'دعم الأسر المنتجة', status: 'completed', progress: 100 },
  { id: '4', name: 'توعية صحية مجتمعية', status: 'active', progress: 45 },
];

export default function DashboardPage() {
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
          value={kpiData.totalProjects}
          icon={<FolderIcon className="h-6 w-6 text-primary-600" />}
          trend={{ value: 12, isPositive: true }}
          iconBgColor="bg-primary-100"
        />
        <StatsCard
          title="المشاريع النشطة"
          value={kpiData.activeProjects}
          icon={<CheckCircleIcon className="h-6 w-6 text-success-600" />}
          iconBgColor="bg-success-50"
        />
        <StatsCard
          title="المستفيدون"
          value={kpiData.totalBeneficiaries.toLocaleString('ar-SA')}
          icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
          trend={{ value: 8, isPositive: true }}
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="الاستبيانات"
          value={kpiData.totalSurveys}
          icon={<ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <StatsCard
          title="درجة الأثر"
          value={`${kpiData.averageImpactScore}%`}
          icon={<ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />}
          trend={{ value: 5, isPositive: true }}
          iconBgColor="bg-emerald-50"
        />
        <StatsCard
          title="نسبة الإنجاز"
          value={`${kpiData.completionRate}%`}
          icon={<ChartBarIcon className="h-6 w-6 text-orange-600" />}
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Impact Trends */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="اتجاهات الأثر"
            subtitle="مقارنة الأثر الفعلي بالمستهدف"
          />
          <LineChart
            data={impactTrendData}
            xKey="month"
            lines={[
              { dataKey: 'impact', name: 'الأثر الفعلي', color: '#0ea5e9' },
              { dataKey: 'target', name: 'المستهدف', color: '#94a3b8', strokeWidth: 2 },
            ]}
            height={280}
          />
        </Card>

        {/* Projects Status */}
        <Card>
          <CardHeader
            title="حالة المشاريع"
            subtitle="توزيع المشاريع حسب الحالة"
          />
          <DonutChart
            data={projectsStatusData}
            centerValue={kpiData.totalProjects}
            centerLabel="مشروع"
            height={280}
            outerRadius={100}
          />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pre/Post Comparison */}
        <Card>
          <CardHeader
            title="مقارنة قبلي / بعدي"
            subtitle="متوسط التقييمات قبل وبعد التدخل"
          />
          <BarChart
            data={prePostComparisonData}
            xKey="name"
            bars={[
              { dataKey: 'pre', name: 'قبل', color: '#94a3b8' },
              { dataKey: 'post', name: 'بعد', color: '#0ea5e9' },
            ]}
            height={280}
          />
        </Card>

        {/* Impact Dimensions */}
        <Card>
          <CardHeader
            title="أبعاد الأثر"
            subtitle="الأداء الفعلي مقابل المستهدف"
          />
          <RadarChart
            data={impactDimensionsData}
            dataKey="dimension"
            radars={[
              { dataKey: 'current', name: 'الحالي', color: '#0ea5e9', fillOpacity: 0.4 },
              { dataKey: 'target', name: 'المستهدف', color: '#22c55e', fillOpacity: 0.2 },
            ]}
            height={280}
          />
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
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'active'
                    ? 'bg-success-50 text-success-700'
                    : project.status === 'completed'
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-secondary-100 text-secondary-700'
                }`}
              >
                {project.status === 'active'
                  ? 'نشط'
                  : project.status === 'completed'
                  ? 'مكتمل'
                  : 'معلق'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
