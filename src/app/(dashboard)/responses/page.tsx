'use client';

import { useState } from 'react';
import { useProjects, useSurveys } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  DataTable,
  Badge,
  Select,
  Input,
  Button,
  Loading,
  EmptyState,
} from '@/components/ui';
import {
  EyeIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Mock responses data
const mockResponses = [
  {
    id: '1',
    surveyTitle: 'استبيان رضا المستفيدين',
    projectName: 'برنامج التمكين الاقتصادي',
    respondent: 'مجهول',
    submittedAt: '2024-01-15T10:30:00',
    completionTime: 12,
    status: 'complete' as const,
  },
  {
    id: '2',
    surveyTitle: 'تقييم قبلي - مهارات التوظيف',
    projectName: 'برنامج التدريب المهني',
    respondent: 'أحمد محمد',
    submittedAt: '2024-01-15T09:15:00',
    completionTime: 8,
    status: 'complete' as const,
  },
  {
    id: '3',
    surveyTitle: 'استبيان رضا المستفيدين',
    projectName: 'برنامج التمكين الاقتصادي',
    respondent: 'مجهول',
    submittedAt: '2024-01-14T16:45:00',
    completionTime: 15,
    status: 'complete' as const,
  },
  {
    id: '4',
    surveyTitle: 'تقييم بعدي - مهارات التوظيف',
    projectName: 'برنامج التدريب المهني',
    respondent: 'سارة علي',
    submittedAt: '2024-01-14T14:20:00',
    completionTime: 10,
    status: 'partial' as const,
  },
  {
    id: '5',
    surveyTitle: 'دراسة احتياج - التعليم',
    projectName: 'برنامج دعم التعليم',
    respondent: 'محمد خالد',
    submittedAt: '2024-01-13T11:00:00',
    completionTime: 20,
    status: 'complete' as const,
  },
];

const statusConfig = {
  complete: { label: 'مكتمل', variant: 'success' as const },
  partial: { label: 'جزئي', variant: 'warning' as const },
  draft: { label: 'مسودة', variant: 'default' as const },
};

export default function ResponsesPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projectsData, isLoading: loadingProjects } = useProjects({ limit: 100 });
  const { data: surveysData, isLoading: loadingSurveys } = useSurveys({
    project: selectedProject || undefined,
    limit: 100
  });

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...(projectsData?.data?.map((p) => ({
      value: p._id,
      label: p.name,
    })) || []),
  ];

  const surveyOptions = [
    { value: '', label: 'جميع الاستبيانات' },
    ...(surveysData?.data?.map((s) => ({
      value: s._id,
      label: s.title,
    })) || []),
  ];

  // Filter responses
  const filteredResponses = mockResponses.filter((response) => {
    if (selectedProject && response.projectName !== projectOptions.find(p => p.value === selectedProject)?.label) {
      return false;
    }
    if (searchQuery && !response.respondent.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'surveyTitle',
      title: 'الاستبيان',
      render: (value: string, row: typeof mockResponses[0]) => (
        <div>
          <p className="font-medium text-secondary-900">{value}</p>
          <p className="text-sm text-secondary-500">{row.projectName}</p>
        </div>
      ),
    },
    {
      key: 'respondent',
      title: 'المستجيب',
    },
    {
      key: 'submittedAt',
      title: 'تاريخ الإرسال',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'completionTime',
      title: 'وقت الإكمال',
      render: (value: number) => `${value} دقيقة`,
    },
    {
      key: 'status',
      title: 'الحالة',
      render: (value: keyof typeof statusConfig) => (
        <Badge variant={statusConfig[value].variant}>
          {statusConfig[value].label}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_: unknown, row: typeof mockResponses[0]) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <EyeIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="الردود"
        subtitle="عرض وإدارة ردود الاستبيانات"
        actions={
          <Button variant="outline">
            <DocumentArrowDownIcon className="h-5 w-5 me-2" />
            تصدير البيانات
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader
          title="تصفية النتائج"
          action={<FunnelIcon className="h-5 w-5 text-secondary-400" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="المشروع"
            options={projectOptions}
            value={selectedProject}
            onChange={setSelectedProject}
            placeholder="اختر المشروع"
          />
          <Select
            label="الاستبيان"
            options={surveyOptions}
            value={selectedSurvey}
            onChange={setSelectedSurvey}
            placeholder="اختر الاستبيان"
          />
          <Input
            label="البحث"
            placeholder="ابحث باسم المستجيب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedProject('');
                setSelectedSurvey('');
                setSearchQuery('');
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-primary-600">{mockResponses.length}</p>
          <p className="text-sm text-secondary-600">إجمالي الردود</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">
            {mockResponses.filter(r => r.status === 'complete').length}
          </p>
          <p className="text-sm text-secondary-600">ردود مكتملة</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-warning-600">
            {mockResponses.filter(r => r.status === 'partial').length}
          </p>
          <p className="text-sm text-secondary-600">ردود جزئية</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-secondary-600">
            {Math.round(mockResponses.reduce((acc, r) => acc + r.completionTime, 0) / mockResponses.length)}
          </p>
          <p className="text-sm text-secondary-600">متوسط وقت الإكمال (دقيقة)</p>
        </Card>
      </div>

      {/* Responses Table */}
      <Card>
        <CardHeader title="قائمة الردود" subtitle={`${filteredResponses.length} رد`} />
        {loadingProjects || loadingSurveys ? (
          <Loading text="جاري التحميل..." />
        ) : filteredResponses.length === 0 ? (
          <EmptyState
            title="لا توجد ردود"
            description="لم يتم العثور على ردود تطابق معايير البحث"
            icon="document"
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredResponses}
            rowKey="id"
          />
        )}
      </Card>
    </div>
  );
}
