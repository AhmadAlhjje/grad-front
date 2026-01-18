'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks';
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
} from '@/components/ui';
import { formatDate, formatCurrency, getProjectTypeLabel } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'draft', label: 'مسودة' },
  { value: 'active', label: 'نشط' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'suspended', label: 'معلق' },
];

const typeOptions = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'intervention', label: 'تدخل' },
  { value: 'research', label: 'بحث' },
  { value: 'assessment', label: 'تقييم' },
  { value: 'monitoring', label: 'رصد' },
];

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const itemsPerPage = 10;

  const { data: allProjects, isLoading, error, refetch } = useProjects({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  // Client-side pagination
  const projects = allProjects || [];
  const totalProjects = projects.length;
  const totalPages = Math.ceil(totalProjects / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="المشاريع"
        subtitle={`إجمالي ${totalProjects} مشروع`}
        actions={
          <Link href="/projects/new">
            <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
              إنشاء مشروع جديد
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="البحث في المشاريع..."
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
          <Button type="submit" variant="outline" leftIcon={<FunnelIcon className="h-5 w-5" />}>
            تصفية
          </Button>
        </form>
      </Card>

      {/* Projects Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8">
            <Loading text="جاري تحميل المشاريع..." />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !paginatedProjects.length ? (
          <EmptyState
            title="لا توجد مشاريع"
            description="لم يتم العثور على أي مشاريع. ابدأ بإنشاء مشروع جديد."
            icon="folder"
            action={{
              label: 'إنشاء مشروع',
              onClick: () => (window.location.href = '/projects/new'),
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المشروع</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ البدء</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الميزانية</TableHead>
                  <TableHead align="center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-secondary-900">{project.name}</p>
                        <p className="text-sm text-secondary-500 line-clamp-1">
                          {project.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{getProjectTypeLabel(project.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                    <TableCell>{formatDate(project.endDate)}</TableCell>
                    <TableCell>
                      {formatCurrency(project.budget.total, project.budget.currency)}
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/projects/${project._id}`}>
                          <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        <Link href={`/projects/${project._id}/edit`}>
                          <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalProjects}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
