'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSurveys } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  StatusBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Loading,
  EmptyState,
  ErrorState,
  ProgressBar,
} from '@/components/ui';
import { formatDate, getSurveyTypeLabel } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'draft', label: 'مسودة' },
  { value: 'active', label: 'نشط' },
  { value: 'closed', label: 'مغلق' },
  { value: 'archived', label: 'مؤرشف' },
];

const typeOptions = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'pre_evaluation', label: 'تقييم قبلي' },
  { value: 'post_evaluation', label: 'تقييم بعدي' },
  { value: 'needs_assessment', label: 'دراسة احتياج' },
  { value: 'satisfaction', label: 'رضا المستفيدين' },
  { value: 'feedback', label: 'تغذية راجعة' },
];

export default function SurveysPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading, error, refetch } = useSurveys({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  return (
    <div>
      <PageHeader
        title="الاستبيانات"
        subtitle={`إجمالي ${data?.total || 0} استبيان`}
        actions={
          <Link href="/surveys/new">
            <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
              إنشاء استبيان جديد
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="البحث في الاستبيانات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          <div className="w-48">
            <Select
              options={statusOptions}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              placeholder="الحالة"
            />
          </div>
          <div className="w-48">
            <Select
              options={typeOptions}
              value={type}
              onChange={(value) => {
                setType(value);
                setPage(1);
              }}
              placeholder="النوع"
            />
          </div>
        </div>
      </Card>

      {/* Surveys Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8">
            <Loading text="جاري تحميل الاستبيانات..." />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.data?.length ? (
          <EmptyState
            title="لا توجد استبيانات"
            description="لم يتم العثور على أي استبيانات. ابدأ بإنشاء استبيان جديد."
            icon="document"
            action={{
              label: 'إنشاء استبيان',
              onClick: () => (window.location.href = '/surveys/new'),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان الاستبيان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الردود</TableHead>
                  <TableHead>تاريخ البدء</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead align="center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((survey) => (
                  <TableRow key={survey._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-secondary-900">{survey.title}</p>
                        <p className="text-sm text-secondary-500 line-clamp-1">
                          {survey.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{getSurveyTypeLabel(survey.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={survey.status} />
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{survey.currentResponses}</span>
                          <span className="text-secondary-400">/ {survey.targetResponses}</span>
                        </div>
                        <ProgressBar
                          value={survey.currentResponses}
                          max={survey.targetResponses}
                          size="sm"
                          variant={
                            survey.currentResponses >= survey.targetResponses
                              ? 'success'
                              : 'primary'
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(survey.startDate)}</TableCell>
                    <TableCell>{formatDate(survey.endDate)}</TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/surveys/${survey._id}`}>
                          <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        <Link href={`/surveys/${survey._id}/edit`}>
                          <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        <Link href={`/surveys/${survey._id}/analytics`}>
                          <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <ChartBarIcon className="h-5 w-5" />
                          </button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                totalItems={data.total}
                itemsPerPage={10}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
