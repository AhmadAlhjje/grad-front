'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store';
import { notify } from '@/store/ui.store';
import { getErrorMessage } from '@/lib/axios';
import { PageHeader } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardFooter,
  Input,
  Button,
  Select,
  Badge,
  Loading,
} from '@/components/ui';
import {
  UserCircleIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const languageOptions = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const themeOptions = [
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
  { value: 'system', label: 'حسب النظام' },
];

const timezoneOptions = [
  { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
  { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
  { value: 'Africa/Cairo', label: 'القاهرة (GMT+2)' },
];

export default function SettingsPage() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch profile from API
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: { name?: string; phone?: string; organization?: string }) =>
      usersApi.update(profile!._id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setUser(updatedUser);
      notify.success('تم تحديث الملف الشخصي بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث الملف الشخصي', getErrorMessage(error));
    },
  });

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });

  // Update form when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
      });
    }
  }, [profile]);

  const [preferences, setPreferences] = useState({
    language: 'ar',
    theme: 'light',
    timezone: 'Asia/Riyadh',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    surveyResponses: true,
    projectUpdates: true,
    weeklyReports: false,
    systemAlerts: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?._id) return;

    updateProfile.mutate({
      name: profileData.name,
      phone: profileData.phone,
      organization: profileData.organization,
    });
  };

  const handleResetProfile = () => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: UserCircleIcon },
    { id: 'preferences', label: 'التفضيلات', icon: PaintBrushIcon },
    { id: 'notifications', label: 'الإشعارات', icon: BellIcon },
    { id: 'security', label: 'الأمان', icon: ShieldCheckIcon },
  ];

  return (
    <div>
      <PageHeader
        title="الإعدادات"
        subtitle="إدارة حسابك وتفضيلاتك"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-start transition-colors ${activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-secondary-600 hover:bg-secondary-50'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader
                title="الملف الشخصي"
                subtitle="معلوماتك الشخصية وبيانات الحساب"
                action={
                  <Badge variant="primary" size="lg">
                    {profile?.role === 'admin' ? 'مدير' : profile?.role === 'manager' ? 'مشرف' : 'مشاهد'}
                  </Badge>
                }
              />
              {profileLoading ? (
                <div className="p-8">
                  <Loading text="جاري تحميل البيانات..." />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="الاسم الكامل"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <Input
                      label="البريد الإلكتروني"
                      type="email"
                      value={profileData.email}
                      disabled
                      helperText="لا يمكن تغيير البريد الإلكتروني"
                    />
                    <Input
                      label="رقم الهاتف"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+966501234567"
                    />
                    <Input
                      label="المنظمة"
                      value={profileData.organization}
                      onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                      placeholder="اسم المنظمة"
                    />
                  </div>

                  <CardFooter>
                    <Button type="button" variant="outline" onClick={handleResetProfile}>
                      إلغاء
                    </Button>
                    <Button type="submit" isLoading={updateProfile.isPending}>
                      حفظ التغييرات
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader
                title="التفضيلات"
                subtitle="تخصيص تجربة الاستخدام"
              />
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <GlobeAltIcon className="h-5 w-5 text-secondary-500" />
                      <span className="font-medium">اللغة</span>
                    </div>
                    <Select
                      options={languageOptions}
                      value={preferences.language}
                      onChange={(value) => setPreferences({ ...preferences, language: value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <PaintBrushIcon className="h-5 w-5 text-secondary-500" />
                      <span className="font-medium">المظهر</span>
                    </div>
                    <Select
                      options={themeOptions}
                      value={preferences.theme}
                      onChange={(value) => setPreferences({ ...preferences, theme: value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <GlobeAltIcon className="h-5 w-5 text-secondary-500" />
                    <span className="font-medium">المنطقة الزمنية</span>
                  </div>
                  <div className="w-full md:w-1/2">
                    <Select
                      options={timezoneOptions}
                      value={preferences.timezone}
                      onChange={(value) => setPreferences({ ...preferences, timezone: value })}
                    />
                  </div>
                </div>

                <CardFooter>
                  <Button variant="outline">إعادة تعيين</Button>
                  <Button>حفظ التفضيلات</Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader
                title="إعدادات الإشعارات"
                subtitle="تحكم في الإشعارات التي تتلقاها"
              />
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'إشعارات البريد الإلكتروني', description: 'تلقي الإشعارات عبر البريد الإلكتروني' },
                  { key: 'surveyResponses', label: 'ردود الاستبيانات', description: 'إشعار عند تلقي ردود جديدة على استبياناتك' },
                  { key: 'projectUpdates', label: 'تحديثات المشاريع', description: 'إشعارات عند حدوث تغييرات في المشاريع' },
                  { key: 'weeklyReports', label: 'التقارير الأسبوعية', description: 'ملخص أسبوعي لنشاط المنصة' },
                  { key: 'systemAlerts', label: 'تنبيهات النظام', description: 'تحديثات وتنبيهات مهمة من النظام' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-secondary-900">{item.label}</p>
                      <p className="text-sm text-secondary-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [item.key]: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <CardFooter>
                <Button>حفظ الإعدادات</Button>
              </CardFooter>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="تغيير كلمة المرور"
                  subtitle="تأكد من استخدام كلمة مرور قوية"
                />
                <form className="space-y-4">
                  <Input
                    label="كلمة المرور الحالية"
                    type="password"
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <Input
                    label="كلمة المرور الجديدة"
                    type="password"
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  <Input
                    label="تأكيد كلمة المرور"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  <CardFooter>
                    <Button>تغيير كلمة المرور</Button>
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader
                  title="جلسات تسجيل الدخول"
                  subtitle="الأجهزة التي سجلت الدخول منها"
                />
                <div className="space-y-3">
                  {[
                    { device: 'Windows - Chrome', location: 'الرياض، السعودية', time: 'نشط الآن', current: true },
                    { device: 'iPhone - Safari', location: 'الرياض، السعودية', time: 'منذ ساعتين', current: false },
                    { device: 'MacBook - Safari', location: 'جدة، السعودية', time: 'منذ 3 أيام', current: false },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                          <KeyIcon className="h-5 w-5 text-secondary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">
                            {session.device}
                            {session.current && (
                              <Badge variant="success" size="sm" className="ms-2">
                                الحالي
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {session.location} • {session.time}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-danger-600">
                          إنهاء الجلسة
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <CardFooter>
                  <Button variant="outline" className="text-danger-600">
                    إنهاء جميع الجلسات الأخرى
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-danger-200 bg-danger-50">
                <CardHeader
                  title="حذف الحساب"
                  subtitle="حذف حسابك وجميع بياناتك بشكل نهائي"
                />
                <p className="text-secondary-600 mb-4">
                  عند حذف حسابك، سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن استرجاعها.
                </p>
                <Button variant="danger">حذف الحساب</Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
