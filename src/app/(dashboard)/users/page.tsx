'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks';
import { PageHeader } from '@/components/layout';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Loading,
  EmptyState,
  ErrorState,
} from '@/components/ui';
import { getInitials } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import type { User } from '@/types';

const userSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').optional().or(z.literal('')),
  role: z.enum(['admin', 'manager', 'viewer'], {
    required_error: 'يرجى اختيار الدور',
  }),
  phone: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const roleOptions = [
  { value: 'admin', label: 'مدير' },
  { value: 'manager', label: 'مشرف' },
  { value: 'viewer', label: 'مشاهد' },
];

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  manager: 'مشرف',
  viewer: 'مشاهد',
};

const roleColors: Record<string, 'primary' | 'success' | 'default'> = {
  admin: 'primary',
  manager: 'success',
  viewer: 'default',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useUsers();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Client-side filtering
  const filteredUsers = data?.data?.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(search)
    );
  }) || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'viewer',
      phone: '',
      organization: '',
      department: '',
    },
  });

  const openAddModal = () => {
    reset({
      name: '',
      email: '',
      password: '',
      role: 'viewer',
      phone: '',
      organization: '',
      department: '',
    });
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      organization: user.organization || '',
      department: user.department || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser._id,
          data: {
            name: data.name,
            phone: data.phone,
            organization: data.organization,
            department: data.department,
            role: data.role,
          },
        });
      } else {
        await createUser.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password || '',
          role: data.role,
          phone: data.phone,
          organization: data.organization,
        });
      }
      closeModal();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteUser.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div>
      <PageHeader
        title="إدارة المستخدمين"
        subtitle={`إجمالي ${filteredUsers.length} مستخدم`}
        actions={
          <Button onClick={openAddModal} leftIcon={<PlusIcon className="h-5 w-5" />}>
            إضافة مستخدم
          </Button>
        }
      />

      {/* Search */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8">
            <Loading text="جاري تحميل المستخدمين..." />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !filteredUsers.length ? (
          <EmptyState
            title={search ? "لم يتم العثور على نتائج" : "لا يوجد مستخدمون"}
            description={search ? "جرب البحث بكلمات مختلفة" : "لم يتم العثور على أي مستخدمين."}
            icon={<UserCircleIcon className="h-8 w-8 text-secondary-400" />}
            action={!search ? {
              label: 'إضافة مستخدم',
              onClick: openAddModal,
            } : undefined}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>المنظمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead align="center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{user.name}</p>
                          {user.phone && (
                            <p className="text-sm text-secondary-500">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role] || 'default'}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.organization || '-'}
                      {user.department && (
                        <span className="text-secondary-400"> / {user.department}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'active' ? 'success' :
                            user.status === 'inactive' ? 'danger' :
                              'default'
                        }
                        dot
                      >
                        {user.status === 'active' ? 'نشط' :
                          user.status === 'inactive' ? 'غير نشط' :
                            'معلق'}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user._id)}
                          className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>


          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="الاسم الكامل"
            placeholder="أدخل الاسم الكامل"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@domain.com"
            required
            disabled={!!editingUser}
            error={errors.email?.message}
            {...register('email')}
          />

          {!editingUser && (
            <Input
              label="كلمة المرور"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password')}
            />
          )}

          <Select
            label="الدور"
            options={roleOptions}
            value={watch('role')}
            onChange={(value) => setValue('role', value as UserFormData['role'])}
            required
            error={errors.role?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="رقم الهاتف"
              type="tel"
              placeholder="+966501234567"
              {...register('phone')}
            />

            <Input
              label="المنظمة"
              placeholder="اسم المنظمة"
              {...register('organization')}
            />
          </div>

          <Input
            label="القسم"
            placeholder="اسم القسم"
            {...register('department')}
          />

          <ModalFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              إلغاء
            </Button>
            <Button
              type="submit"
              isLoading={createUser.isPending || updateUser.isPending}
            >
              {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <p className="text-secondary-600 mb-6">
          هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteUser.isPending}
          >
            حذف
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
