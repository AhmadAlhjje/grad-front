'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useProjects, useSurveys, useSurveyResponses } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  Badge,
  Select,
  Input,
  Button,
  Loading,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import {
  EyeIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { Survey, Project } from '@/types';

const statusConfig = {
  completed: { label: 'مكتمل', variant: 'success' as const },
  submitted: { label: 'مكتمل', variant: 'success' as const },
  draft: { label: 'مسودة', variant: 'default' as const },
  partial: { label: 'جزئي', variant: 'warning' as const },
};

export default function ResponsesPage() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch projects
  const { data: projectsData, isLoading: loadingProjects, error: projectsError } = useProjects();

  // Fetch surveys - don't filter by project to get all surveys
  const { data: surveysData, isLoading: loadingSurveys, error: surveysError } = useSurveys();

  // Fetch responses for selected survey
  const { data: responsesData, isLoading: loadingResponses, error: responsesError } = useSurveyResponses(selectedSurvey);

  // Debug logging
  useEffect(() => {
    console.log('Projects data:', projectsData);
    console.log('Surveys data:', surveysData);
    console.log('Responses data:', responsesData);
    console.log('Selected survey:', selectedSurvey);
  }, [projectsData, surveysData, responsesData, selectedSurvey]);

  // Filter surveys by selected project
  const filteredSurveys = useMemo(() => {
    if (!surveysData) return [];
    if (!selectedProject) return surveysData;

    return surveysData.filter(survey => {
      const projectId = typeof survey.project === 'object'
        ? (survey.project as Project)._id
        : survey.project;
      return projectId === selectedProject;
    });
  }, [surveysData, selectedProject]);

  const projectOptions = useMemo(() => [
    { value: '', label: 'جميع المشاريع' },
    ...(projectsData?.map((p) => ({
      value: p._id,
      label: p.name,
    })) || []),
  ], [projectsData]);

  const surveyOptions = useMemo(() => [
    { value: '', label: 'اختر استبيان' },
    ...(filteredSurveys?.map((s) => ({
      value: s._id,
      label: s.title,
    })) || []),
  ], [filteredSurveys]);

  // Get survey info for display
  const getSurveyInfo = (surveyId: string) => {
    const survey = surveysData?.find(s => s._id === surveyId);
    if (!survey) return { title: 'غير معروف', projectName: 'غير معروف' };

    const projectName = typeof survey.project === 'object'
      ? (survey.project as Project).name
      : projectsData?.find(p => p._id === survey.project)?.name || 'غير معروف';

    return { title: survey.title, projectName };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Statistics
  const stats = useMemo(() => {
    if (!responsesData || !Array.isArray(responsesData)) {
      return { total: 0, completed: 0, partial: 0, avgTime: 0 };
    }

    const completed = responsesData.filter(r => r.status === 'completed' || r.status === 'submitted').length;
    const partial = responsesData.filter(r => r.status === 'draft').length;
    const totalTime = responsesData.reduce((acc, r) => acc + (r.completionTime || 0), 0);
    const avgTime = responsesData.length > 0 ? Math.round(totalTime / responsesData.length / 60) : 0;

    return {
      total: responsesData.length,
      completed,
      partial,
      avgTime
    };
  }, [responsesData]);

  const isLoading = loadingProjects || loadingSurveys;

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
            onChange={(value) => {
              setSelectedProject(value);
              setSelectedSurvey(''); // Reset survey when project changes
            }}
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
            placeholder="ابحث..."
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
          <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
          <p className="text-sm text-secondary-600">إجمالي الردود</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-success-600">{stats.completed}</p>
          <p className="text-sm text-secondary-600">ردود مكتملة</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-warning-600">{stats.partial}</p>
          <p className="text-sm text-secondary-600">ردود جزئية</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-3xl font-bold text-secondary-600">{stats.avgTime}</p>
          <p className="text-sm text-secondary-600">متوسط وقت الإكمال (دقيقة)</p>
        </Card>
      </div>

      {/* Responses Table */}
      <Card>
        <CardHeader
          title="قائمة الردود"
          subtitle={selectedSurvey ? `${responsesData?.length || 0} رد` : 'اختر استبيان لعرض الردود'}
        />

        {isLoading ? (
          <Loading text="جاري التحميل..." />
        ) : !selectedSurvey ? (
          <EmptyState
            title="اختر استبيان"
            description="يرجى اختيار استبيان من القائمة أعلاه لعرض الردود"
            icon="document"
          />
        ) : loadingResponses ? (
          <Loading text="جاري تحميل الردود..." />
        ) : !responsesData || responsesData.length === 0 ? (
          <EmptyState
            title="لا توجد ردود"
            description="لم يتم العثور على ردود لهذا الاستبيان"
            icon="document"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاستبيان</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإرسال</TableHead>
                <TableHead>نسبة الإكمال</TableHead>
                <TableHead>الجهاز</TableHead>
                <TableHead align="center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsesData.map((response) => {
                const surveyInfo = getSurveyInfo(
                  typeof response.survey === 'object'
                    ? (response.survey as Survey)._id
                    : response.survey
                );
                return (
                  <TableRow key={response._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-secondary-900">{surveyInfo.title}</p>
                        <p className="text-sm text-secondary-500">{surveyInfo.projectName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[response.status as keyof typeof statusConfig]?.variant || 'default'}>
                        {statusConfig[response.status as keyof typeof statusConfig]?.label || response.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(response.completedAt || response.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${response.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-secondary-600">
                          {response.completionPercentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-secondary-600">
                        {response.metadata?.deviceType || '-'}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <Link href={`/responses/${response._id}`}>
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
