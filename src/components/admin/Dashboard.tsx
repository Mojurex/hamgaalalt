'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils/api';
import type { ApiResponse, JWTPayload } from '@/types';

interface Report {
  _id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  isUrgent: boolean;
  attachments?: string[];
  studentName?: string;
  reporterId?: { _id?: string; fullName?: string; grade?: number; classSection?: string } | string;
  reporterSnapshot?: { fullName?: string | null; grade?: number | null; classSection?: string | null };
  notes?: string;
}

interface Analytics {
  totalReports: number;
  urgentReports: number;
  severityBreakdown: Array<{ _id: string; count: number }>;
  categoryBreakdown: Array<{ _id: string; count: number }>;
  statusBreakdown: Array<{ _id: string; count: number }>;
  monthlyReports: Array<{ _id: string; count: number }>;
}

interface Professional {
  _id: string;
  name: string;
  role: string;
  email: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  peer_bullying: 'Үе тэнгийн дээрэлхэлт',
  relationship_abuse: 'Харилцааны зөрчил',
  mental_stress: 'Сэтгэл түгших',
  family_violence: 'Гэр бүлийн асуудал',
  cyberbullying: 'Цахим дарамт',
  other: 'Бусад',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Шинэ',
  'in-progress': 'Явагдаж буй',
  resolved: 'Шийдэгдсэн',
  archived: 'Архивласан',
};

const severityBadge = (severity: Report['severity']) => {
  if (severity === 'high') return 'bg-red-100 text-red-800';
  if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const severityLabel = (severity: Report['severity']) => {
  if (severity === 'high') return '🔴 Өндөр';
  if (severity === 'medium') return '🟡 Дундаж';
  return '🟢 Бага';
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' });

const getReporterInfo = (report: Report) => {
  const populatedReporter = typeof report.reporterId === 'object' ? report.reporterId : null;
  const snapshot = report.reporterSnapshot;
  const fallbackName = report.studentName;
  const fullName = snapshot?.fullName || populatedReporter?.fullName || fallbackName || 'Тодорхойгүй';
  const grade = snapshot?.grade ?? populatedReporter?.grade;
  const classSection = snapshot?.classSection || populatedReporter?.classSection;
  const classLabel = grade && classSection ? `${grade}${classSection}` : 'Тодорхойгүй';
  return { fullName, classLabel };
};

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved' | 'archived'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editStatus, setEditStatus] = useState('new');
  const [editSeverity, setEditSeverity] = useState<Report['severity']>('low');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    setError('');

    try {
      const verify = await apiFetch<ApiResponse<JWTPayload>>('/api/auth/verify');
      if (verify.data?.role !== 'admin') {
        setError('Unauthorized');
        router.push('/admin/login');
        return;
      }

      const [reportsData, analyticsData, professionalsData] = await Promise.all([
        apiFetch<ApiResponse<Report[]>>('/api/reports'),
        apiFetch<ApiResponse<Analytics>>('/api/admin/analytics'),
        apiFetch<ApiResponse<Professional[]>>('/api/professionals'),
      ]);

      setReports(reportsData.data || []);
      setAnalytics(analyticsData.data || null);
      setProfessionals(professionalsData.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching data';
      setError(message);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    const now = new Date();

    return reports
      .filter((report) => {
      if (severityFilter !== 'all' && report.severity !== severityFilter) {
        return false;
      }

      if (statusFilter !== 'all' && report.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== 'all' && report.category !== categoryFilter) {
        return false;
      }

      if (assignedFilter !== 'all' && (report.assignedTo || 'unassigned') !== assignedFilter) {
        return false;
      }

      if (dateFilter !== 'all') {
        const createdAt = new Date(report.createdAt);
        if (dateFilter === 'today') {
          return createdAt.toDateString() === now.toDateString();
        }
        if (dateFilter === 'week') {
          const diff = now.getTime() - createdAt.getTime();
          return diff <= 7 * 24 * 60 * 60 * 1000;
        }
        if (dateFilter === 'month') {
          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        }
      }

      return true;
    })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, severityFilter, statusFilter, dateFilter, categoryFilter, assignedFilter]);

  const latestReports = filteredReports.slice(0, 8);

  const topIssues = useMemo(() => {
    const breakdown = analytics?.categoryBreakdown || [];
    return [...breakdown].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [analytics]);

  const categoryOptions = useMemo(() => {
    const breakdown = analytics?.categoryBreakdown || [];
    return breakdown.map((item) => item._id);
  }, [analytics]);

  const assignedOptions = useMemo(() => {
    const mapped = professionals.map((pro) => ({ id: pro._id, name: pro.name }));
    return [{ id: 'unassigned', name: 'Томилоогүй' }, ...mapped];
  }, [professionals]);

  const getSeverityCount = (severity: 'high' | 'medium' | 'low') => {
    return analytics?.severityBreakdown.find((item) => item._id === severity)?.count || 0;
  };

  const handleLogout = () => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.push('/');
  };

  const openEdit = (report: Report) => {
    setSelectedReport(report);
    setEditStatus(report.status || 'new');
    setEditSeverity(report.severity || 'low');
    setEditAssignedTo(report.assignedTo || '');
    setEditNotes(report.notes || '');
  };

  const closeEdit = () => {
    setSelectedReport(null);
    setEditStatus('new');
    setEditSeverity('low');
    setEditAssignedTo('');
    setEditNotes('');
  };

  const handleSave = async () => {
    if (!selectedReport) {
      return;
    }

    try {
      const updated = await apiFetch<ApiResponse<Report>>(`/api/reports/${selectedReport._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          severity: editSeverity,
          assignedTo: editAssignedTo || null,
          notes: editNotes,
        }),
      });

      setReports((prev) =>
        prev.map((report) => (report._id === selectedReport._id ? (updated.data as Report) : report))
      );
      setToast('Тайлан амжилттай шинэчлэгдлээ.');
      setTimeout(() => setToast(''), 2500);
      closeEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Шинэчлэхэд алдаа гарлаа';
      setError(message);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 h-24"></div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 h-64"></div>
          <div className="bg-white rounded-xl shadow-md p-6 h-72"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <Link href="/">
            <button className="flex items-center text-cyan-600 hover:text-cyan-700 font-semibold">
              ← Буцах
            </button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Админ панель</h1>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <Link href="/admin/health">
              <button className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all">
                API Health
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Гарах
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {toast && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{toast}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setSeverityFilter('all')}
            className="bg-white rounded-xl shadow-md p-6 text-left border border-gray-100 hover:shadow-lg transition-all"
          >
            <p className="text-gray-600 text-sm font-semibold mb-2">НИЙТ ТАЙЛАН</p>
            <p className="text-3xl font-bold text-gray-800">{analytics?.totalReports || 0}</p>
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className="bg-red-50 rounded-xl shadow-md p-6 text-left border border-red-100 hover:shadow-lg transition-all"
          >
            <p className="text-gray-600 text-sm font-semibold mb-2">ӨНДӨР ЭРСДЭЛ</p>
            <p className="text-3xl font-bold text-red-600">{getSeverityCount('high')}</p>
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            className="bg-yellow-50 rounded-xl shadow-md p-6 text-left border border-yellow-100 hover:shadow-lg transition-all"
          >
            <p className="text-gray-600 text-sm font-semibold mb-2">ДУНДАЖ ЭРСДЭЛ</p>
            <p className="text-3xl font-bold text-yellow-600">{getSeverityCount('medium')}</p>
          </button>
          <button
            onClick={() => setSeverityFilter('low')}
            className="bg-green-50 rounded-xl shadow-md p-6 text-left border border-green-100 hover:shadow-lg transition-all"
          >
            <p className="text-gray-600 text-sm font-semibold mb-2">БАГА ЭРСДЭЛ</p>
            <p className="text-3xl font-bold text-green-600">{getSeverityCount('low')}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top issues */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Энэ сарын түгээмэл асуудал</h2>
              {categoryFilter !== 'all' && (
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="text-xs text-cyan-600 font-semibold"
                >
                  Шүүлт цэвэрлэх
                </button>
              )}
            </div>
            {topIssues.length === 0 ? (
              <p className="text-sm text-gray-500">Одоогоор мэдээлэл байхгүй.</p>
            ) : (
              <ul className="space-y-3">
                {topIssues.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-cyan-50 border border-cyan-100 cursor-pointer hover:bg-cyan-100"
                    onClick={() => setCategoryFilter(item._id)}
                  >
                    <span className="text-sm font-semibold text-gray-800">
                      {CATEGORY_NAMES[item._id] || item._id}
                    </span>
                    <span className="text-sm font-bold text-cyan-700">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Шүүлтүүрүүд</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'today', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateFilter(range as any)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    dateFilter === range
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'all'
                    ? 'Бүгд'
                    : range === 'today'
                      ? 'Өнөөдөр'
                      : range === 'week'
                        ? 'Энэ долоо хоног'
                        : 'Энэ сар'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverityFilter(level as any)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    severityFilter === level
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all'
                    ? 'Бүх эрсдэл'
                    : level === 'high'
                      ? 'Өндөр'
                      : level === 'medium'
                        ? 'Дундаж'
                        : 'Бага'}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'new', 'in-progress', 'resolved', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    statusFilter === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Бүх төлөв' : STATUS_LABELS[status]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Ангилал</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">Бүх ангилал</option>
                  {categoryOptions.map((id) => (
                    <option key={id} value={id}>
                      {CATEGORY_NAMES[id] || id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Хариуцагч</label>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">Бүгд</option>
                  {assignedOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600">
                Өнгөний тайлбар: 🔴 Өндөр, 🟡 Дундаж, 🟢 Бага. Дээрх товчлуурууд дээр дарж шүүлтүүрийн үр дүнг шууд харна.
              </p>
            </div>
          </div>
        </div>

        {/* Secondary charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Эрсдэлийн зураглал</h2>
            <div className="space-y-3">
              {(['high', 'medium', 'low'] as const).map((level) => {
                const count = getSeverityCount(level);
                const total = analytics?.totalReports || 1;
                const percent = Math.round((count / total) * 100);
                return (
                  <button
                    key={level}
                    onClick={() => setSeverityFilter(level)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1">
                      <span>{severityLabel(level)}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          level === 'high' ? 'bg-red-300' : level === 'medium' ? 'bg-yellow-300' : 'bg-green-300'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ангиллын зураглал</h2>
            <div className="space-y-3">
              {(analytics?.categoryBreakdown || []).slice(0, 6).map((item) => (
                <button
                  key={item._id}
                  onClick={() => setCategoryFilter(item._id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1">
                    <span>{CATEGORY_NAMES[item._id] || item._id}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full">
                    <div
                      className="h-2 rounded-full bg-cyan-300"
                      style={{
                        width: `${Math.round((item.count / (analytics?.totalReports || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </button>
              ))}
              {(analytics?.categoryBreakdown || []).length === 0 && (
                <p className="text-sm text-gray-500">Одоогоор өгөгдөл байхгүй.</p>
              )}
            </div>
          </div>
        </div>

        {/* Latest Reports */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-800">Сүүлийн тайлангууд</h2>
            <span className="text-sm text-gray-500">Нийт: {filteredReports.length}</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Одоогоор тайлан байхгүй байна. Шүүлтүүрүүдийг шалгана уу.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-sm">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Огноо</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Сурагч</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Анги</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ангилал</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Эрсдэл</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Төлөв</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Хариуцагч</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestReports.map((report) => (
                      <tr
                        key={report._id}
                        onClick={() => openEdit(report)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-4 px-4 text-sm text-gray-600">{formatDate(report.createdAt)}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{getReporterInfo(report).fullName}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{getReporterInfo(report).classLabel}</td>
                        <td className="py-4 px-4">
                          <span className="text-gray-800 font-medium">
                            {CATEGORY_NAMES[report.category] || report.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full font-semibold text-xs ${severityBadge(report.severity)}`}>
                            {severityLabel(report.severity)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{STATUS_LABELS[report.status] || report.status}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {professionals.find((pro) => pro._id === report.assignedTo)?.name || 'Томилоогүй'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {latestReports.map((report) => (
                  <button
                    key={report._id}
                    onClick={() => openEdit(report)}
                    className="w-full text-left border border-gray-100 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{formatDate(report.createdAt)}</span>
                      <span className={`px-2 py-1 rounded-full font-semibold text-xs ${severityBadge(report.severity)}`}>
                        {severityLabel(report.severity)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      <p>Сурагч: {getReporterInfo(report).fullName}</p>
                      <p>Анги: {getReporterInfo(report).classLabel}</p>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      {CATEGORY_NAMES[report.category] || report.category}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{STATUS_LABELS[report.status] || report.status}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Хариуцагч: {professionals.find((pro) => pro._id === report.assignedTo)?.name || 'Томилоогүй'}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Drawer */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Тайлан засах</h2>
              <button onClick={closeEdit} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                <p className="text-sm text-cyan-800 font-semibold mb-2">Сурагчийн мэдээлэл</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Нэр: {getReporterInfo(selectedReport).fullName}</p>
                  <p>Анги: {getReporterInfo(selectedReport).classLabel}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Дэлгэрэнгүй</p>
                <p className="font-semibold text-gray-800 mb-2">
                  {CATEGORY_NAMES[selectedReport.category] || selectedReport.category}
                </p>
                <p className="text-sm text-gray-600 mb-2">{selectedReport.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Огноо: {formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Хавсралт</p>
                {selectedReport.attachments && selectedReport.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReport.attachments.map((item, index) => {
                      const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(item);
                      return (
                        <div key={`${item}-${index}`} className="border border-gray-200 rounded-lg p-2">
                          {isImage && (
                            <img src={item} alt={`attachment-${index}`} className="w-full rounded-md mb-2" />
                          )}
                          <a href={item} className="text-xs text-cyan-700 break-all">
                            {item}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Хавсралт байхгүй.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Эрсдэл</label>
                <select
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(e.target.value as Report['severity'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="high">Өндөр</option>
                  <option value="medium">Дундаж</option>
                  <option value="low">Бага</option>
                </select>
              </div>

              {editSeverity === 'high' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-semibold mb-2">⚠️ Өндөр эрсдэл</p>
                  <p className="text-xs text-red-600">Яаралтай тусламжийн дугаар: 101 / 102 / 103</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Төлөв</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="new">Шинэ</option>
                  <option value="in-progress">Явагдаж буй</option>
                  <option value="resolved">Шийдэгдсэн</option>
                  <option value="archived">Архивласан</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Хариуцагч</label>
                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Томилоогүй</option>
                  {professionals.map((pro) => (
                    <option key={pro._id} value={pro._id}>
                      {pro.name} ({pro.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Админ тэмдэглэл</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-24"
                  placeholder="Дотоод тэмдэглэл"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg"
                >
                  Хадгалах
                </button>
                <button
                  onClick={closeEdit}
                  className="flex-1 border border-gray-200 text-gray-700 font-bold py-2 rounded-lg"
                >
                  Болих
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
