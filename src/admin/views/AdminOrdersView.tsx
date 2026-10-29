import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  X,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Filter,
  Eye,
  GripVertical,
  ExternalLink,
  Tag,
  FileText,
  BadgePercent,
  Layers,
  ArrowRight,
  Printer,
  Receipt,
  Bell,
  Sparkles,
} from 'lucide-react';
import { adminApi, AdminOrder } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAdminNotificationStore } from '../store/useAdminNotificationStore';
import { InvoiceModal } from '../../components/order/InvoiceModal';

type StatusKey = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready_pickup' | 'out_delivery' | 'delivered' | 'cancelled';
type ViewMode = 'board' | 'table';

export const AdminOrdersView: React.FC = () => {
  const { language, isRTL } = useLanguageStore();
  const isAr = language === 'ar';

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('board');

  // Selected Order & Details Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Invoice Printing Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceOrderId, setInvoiceOrderId] = useState<number | null>(null);

  // Updating & DnD
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [draggingOrderId, setDraggingOrderId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const { newOrderIds, clearNewBadge } = useAdminNotificationStore();

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOrders({ limit: 200 });
      setOrders(res.orders || []);
    } catch (err: any) {
      setError(err?.message || (isAr ? 'فشل تحميل قائمة الطلبات من Odoo ERP' : 'Failed to load orders from Odoo'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Listen to real-time new incoming orders and focus events from background poller
  useEffect(() => {
    const handleNewOrderArrived = (e: any) => {
      const { orders: newOnes } = e.detail || {};
      if (newOnes && Array.isArray(newOnes)) {
        setOrders((prev) => {
          const prevIds = new Set(prev.map((o) => o.id));
          const toAdd = newOnes.filter((o: any) => !prevIds.has(o.id));
          return [...toAdd, ...prev];
        });
      }
    };

    const handleFocusOrder = async (e: any) => {
      const orderId = e.detail?.orderId;
      if (!orderId) return;
      setOrders((currentOrders) => {
        const found = currentOrders.find((o) => o.id === orderId);
        if (found) {
          setSelectedOrder(found);
          clearNewBadge(orderId);
        } else {
          adminApi
            .getOrderById(orderId)
            .then((full) => {
              if (full) {
                setSelectedOrder(full);
                clearNewBadge(orderId);
              }
            })
            .catch(() => {});
        }
        return currentOrders;
      });
    };

    window.addEventListener('admin_new_order_arrived', handleNewOrderArrived);
    window.addEventListener('admin_focus_order', handleFocusOrder);

    return () => {
      window.removeEventListener('admin_new_order_arrived', handleNewOrderArrived);
      window.removeEventListener('admin_focus_order', handleFocusOrder);
    };
  }, [clearNewBadge]);

  // When selectedOrder changes, fetch full details from backend
  useEffect(() => {
    if (!selectedOrder) {
      setOrderDetails(null);
      return;
    }
    let isCancelled = false;
    const fetchFullDetails = async () => {
      setLoadingDetails(true);
      try {
        const full = await adminApi.getOrderById(selectedOrder.id);
        if (!isCancelled) {
          setOrderDetails(full);
        }
      } catch {
        if (!isCancelled) {
          setOrderDetails(selectedOrder);
        }
      } finally {
        if (!isCancelled) setLoadingDetails(false);
      }
    };
    fetchFullDetails();
    return () => {
      isCancelled = true;
    };
  }, [selectedOrder?.id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, state: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, state: newStatus } : null));
        setOrderDetails((prev: any) => (prev ? { ...prev, state: newStatus } : null));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusMeta = (state: string) => {
    switch (state) {
      case 'draft':
      case 'pending_payment':
      case 'pending':
        return {
          labelAr: 'طلب جديد',
          labelEn: 'Pending',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          badgeBg: 'bg-amber-500',
        };
      case 'confirmed':
        return {
          labelAr: 'مؤكد',
          labelEn: 'Confirmed',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          badgeBg: 'bg-blue-500',
        };
      case 'preparing':
      case 'in_preparation':
        return {
          labelAr: 'قيد الذبح والتجهيز',
          labelEn: 'Preparing',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          badgeBg: 'bg-purple-500',
        };
      case 'ready_pickup':
        return {
          labelAr: 'جاهز للاستلام',
          labelEn: 'Ready Pickup',
          color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          badgeBg: 'bg-indigo-500',
        };
      case 'out_delivery':
      case 'in_delivery':
        return {
          labelAr: 'في الطريق للتسليم',
          labelEn: 'Out for Delivery',
          color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          badgeBg: 'bg-cyan-500',
        };
      case 'delivered':
      case 'done':
        return {
          labelAr: 'تم التسليم بنجاح',
          labelEn: 'Delivered',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          badgeBg: 'bg-emerald-500',
        };
      case 'cancelled':
        return {
          labelAr: 'ملغي',
          labelEn: 'Cancelled',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          badgeBg: 'bg-rose-500',
        };
      default:
        return {
          labelAr: state,
          labelEn: state,
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          badgeBg: 'bg-slate-500',
        };
    }
  };

  // Extract available months from orders
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.date && o.date.length >= 7) {
        set.add(o.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [orders]);

  const formatMonthLabel = (m: string) => {
    if (!m) return '';
    const [year, month] = m.split('-');
    const monthsAr: Record<string, string> = {
      '01': 'يناير',
      '02': 'فبراير',
      '03': 'مارس',
      '04': 'أبريل',
      '05': 'مايو',
      '06': 'يونيو',
      '07': 'يوليو',
      '08': 'أغسطس',
      '09': 'سبتمبر',
      '10': 'أكتوبر',
      '11': 'نوفمبر',
      '12': 'ديسمبر',
    };
    return isAr ? `${monthsAr[month] || month} ${year}` : `${year}-${month}`;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Hide incomplete online payment sessions that have not been paid yet
      if (o.state === 'pending_payment' && o.paymentStatus !== 'paid') {
        return false;
      }

      // Month filter
      if (monthFilter !== 'all') {
        if (!o.date || !o.date.startsWith(monthFilter)) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const s = o.state;
        if (statusFilter === 'pending' && !['draft', 'pending'].includes(s)) return false;
        if (statusFilter === 'confirmed' && s !== 'confirmed') return false;
        if (statusFilter === 'preparing' && !['preparing', 'in_preparation'].includes(s)) return false;
        if (statusFilter === 'ready_pickup' && s !== 'ready_pickup') return false;
        if (statusFilter === 'out_delivery' && !['out_delivery', 'in_delivery'].includes(s)) return false;
        if (statusFilter === 'delivered' && !['delivered', 'done'].includes(s)) return false;
        if (statusFilter === 'cancelled' && s !== 'cancelled') return false;
      }

      // Delivery filter
      if (deliveryFilter !== 'all') {
        const isDelivery = o.deliveryType === 'delivery' || o.deliveryType === 'address';
        if (deliveryFilter === 'delivery' && !isDelivery) return false;
        if (deliveryFilter === 'pickup' && isDelivery) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        const isPaid = o.paymentStatus === 'paid';
        if (paymentFilter === 'paid' && !isPaid) return false;
        if (paymentFilter === 'unpaid' && isPaid) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = o.name?.toLowerCase().includes(q);
        const matchesCust = o.customerName?.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone?.includes(q);
        if (!matchesName && !matchesCust && !matchesPhone) return false;
      }

      return true;
    });
  }, [orders, statusFilter, monthFilter, deliveryFilter, paymentFilter, searchQuery]);

  const pipelineStages = [
    { id: 'pending', titleAr: 'طلبات جديدة', titleEn: 'New Orders', targetState: 'pending', states: ['draft', 'pending', 'pending_payment'] },
    { id: 'confirmed', titleAr: 'طلبات مؤكدة', titleEn: 'Confirmed', targetState: 'confirmed', states: ['confirmed'] },
    { id: 'preparing', titleAr: 'قيد الذبح والتجهيز', titleEn: 'Preparing', targetState: 'preparing', states: ['preparing', 'in_preparation'] },
    { id: 'out_delivery', titleAr: 'في طريق التوصيل', titleEn: 'Out for Delivery', targetState: 'out_delivery', states: ['out_delivery', 'in_delivery', 'ready_pickup'] },
    { id: 'delivered', titleAr: 'تم التسليم بنجاح', titleEn: 'Delivered', targetState: 'delivered', states: ['delivered', 'done'] },
    { id: 'cancelled', titleAr: 'طلبات ملغية', titleEn: 'Cancelled', targetState: 'cancelled', states: ['cancelled'] },
  ];

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Ref', 'Date', 'Customer', 'Phone', 'Total', 'State', 'Payment', 'Delivery'];
    const rows = orders.map((o) => [
      `"${o.name}"`,
      `"${o.date}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      o.total,
      o.state,
      o.paymentStatus,
      o.deliveryType,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhabayih_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'إدارة ومسار تجهيز الطلبات' : 'Orders & Butchery Dispatch'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {isAr ? `إجمالي ${orders.length} طلب مسجل عبر منصة أودو` : `Total ${orders.length} orders in Odoo`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dual View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[44px]">
            <button
              onClick={() => setViewMode('board')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-gold-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={isAr ? 'عرض اللوحة (Kanban)' : 'Board View'}
            >
              <LayoutGrid size={15} />
              <span>{isAr ? 'اللوحة' : 'Board'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-gold-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={isAr ? 'عرض الجدول' : 'Table View'}
            >
              <TableIcon size={15} />
              <span>{isAr ? 'الجدول' : 'Table'}</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-slate-400" />
            <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
          </button>

          <button
            onClick={loadOrders}
            className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition shadow-xs cursor-pointer"
            title={isAr ? 'تحديث' : 'Refresh'}
            aria-label={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث برقم الطلب، اسم العميل، أو الهاتف...' : 'Search order #, customer, phone...'}
              className="w-full ps-9 pe-3 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Sub Filters including MONTH FILTER */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter size={13} />
              <span>{isAr ? 'تصفية:' : 'Filter:'}</span>
            </div>

            {/* MONTH FILTER (Requested by User) */}
            <div className="relative inline-flex items-center flex-1 sm:flex-none">
              <Calendar size={13} className="absolute start-2.5 text-brand-600 pointer-events-none" />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full sm:w-auto ps-7 pe-3 py-2 min-h-[44px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="all">{isAr ? ' كل الأشهر' : ' All Months'}</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-3 py-2 min-h-[44px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? 'كل طرق الاستلام' : 'All Delivery Types'}</option>
              <option value="delivery">{isAr ? 'توصيل للمنزل' : 'Home Delivery'}</option>
              <option value="pickup">{isAr ? 'استلام من الفرع' : 'Branch Pickup'}</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-3 py-2 min-h-[44px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">{isAr ? 'كل حالات الدفع' : 'All Payment States'}</option>
              <option value="paid">{isAr ? 'مدفوع' : 'Paid'}</option>
              <option value="unpaid">{isAr ? 'غير مدفوع' : 'Unpaid'}</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 no-scrollbar -webkit-overflow-scrolling-touch">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'pending', label: isAr ? 'جديد' : 'Pending' },
            { id: 'confirmed', label: isAr ? 'مؤكد' : 'Confirmed' },
            { id: 'preparing', label: isAr ? 'قيد التجهيز' : 'Preparing' },
            { id: 'out_delivery', label: isAr ? 'في الطريق' : 'Out for Delivery' },
            { id: 'delivered', label: isAr ? 'تم التسليم' : 'Delivered' },
            { id: 'cancelled', label: isAr ? 'ملغي' : 'Cancelled' },
          ].map((tab: any) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs shadow-brand-900/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── View 1: Kanban Board Pipeline with Drag and Drop ────────────────────────────────────────── */}
      {viewMode === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-6 items-start">
          {pipelineStages.map((stage) => {
            const stageOrders = filteredOrders.filter((o) => stage.states.includes(o.state));
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverStage !== stage.id) setDragOverStage(stage.id);
                }}
                onDragLeave={() => {
                  if (dragOverStage === stage.id) setDragOverStage(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStage(null);
                  const orderId = Number(e.dataTransfer.getData('text/plain'));
                  if (orderId) {
                    handleStatusChange(orderId, stage.targetState);
                  }
                }}
                className={`flex flex-col rounded-2xl p-3 w-[84vw] max-w-[320px] sm:w-[310px] shrink-0 max-h-[750px] transition-all duration-200 ${
                  isOver
                    ? 'bg-brand-500/10 border-2 border-dashed border-brand-500 ring-2 ring-brand-500/20'
                    : 'bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-gold-400"></span>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {isAr ? stage.titleAr : stage.titleEn}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {stageOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pe-1">
                  {stageOrders.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-[11px] font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      {isAr ? 'لا توجد طلبات هنا' : 'No orders in stage'}
                    </div>
                  ) : (
                    stageOrders.map((o) => {
                      const isDragging = draggingOrderId === o.id;

                      return (
                        <div
                          key={o.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(o.id));
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingOrderId(o.id);
                          }}
                          onDragEnd={() => setDraggingOrderId(null)}
                          onClick={() => {
                            setSelectedOrder(o);
                            clearNewBadge(o.id);
                          }}
                          className={`p-3.5 rounded-xl bg-white dark:bg-slate-900 border transition cursor-grab active:cursor-grabbing space-y-2.5 group relative shadow-xs hover:border-brand-500/50 hover:shadow-md ${
                            isDragging
                              ? 'opacity-40 border-dashed border-brand-500 scale-95'
                              : newOrderIds.includes(o.id)
                              ? 'border-emerald-400 ring-1 ring-emerald-300 dark:border-emerald-600'
                              : 'border-slate-200/90 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <GripVertical size={13} className="text-slate-300 group-hover:text-slate-500 transition" />
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono group-hover:text-brand-600 transition">
                                {o.name}
                              </span>
                              {newOrderIds.includes(o.id) && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse flex items-center gap-1 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                  {isAr ? 'جديد' : 'NEW'}
                                </span>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                o.state === 'cancelled' || o.paymentStatus === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : o.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {o.state === 'cancelled' || o.paymentStatus === 'cancelled'
                                ? (isAr ? 'ملغي' : 'Cancelled')
                                : o.paymentStatus === 'paid'
                                ? (isAr ? 'مدفوع' : 'Paid')
                                : (isAr ? 'غير مدفوع (بانتظار السداد)' : 'Unpaid')}
                            </span>
                          </div>

                          <div className="text-xs">
                            <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {o.customerName || (isAr ? 'عميل بدون اسم' : 'Unnamed Customer')}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                              <span>{o.customerPhone || '-'}</span>
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {o.date?.slice(0, 10)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-black text-brand-600 dark:text-gold-400">
                              {o.total} <span className="text-[10px] font-normal text-slate-400">{isAr ? 'ر.س' : 'SAR'}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInvoiceOrderId(o.id);
                                  setInvoiceModalOpen(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition cursor-pointer"
                                title={isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                              >
                                <Printer size={13} />
                              </button>
                              <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {o.itemCount} {isAr ? 'عناصر' : 'items'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View 2: Data Table & Mobile Cards ────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {/* Mobile Cards View (Visible on screens < md) */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                {isAr ? 'لا توجد طلبات مطابقة للفلتر المحدد' : 'No matching orders found'}
              </div>
            ) : (
              filteredOrders.map((o) => {
                const statusMeta = getStatusMeta(o.state);
                const isPaid = o.paymentStatus === 'paid';

                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedOrder(o);
                      clearNewBadge(o.id);
                    }}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition cursor-pointer shadow-xs space-y-3 ${
                      newOrderIds.includes(o.id)
                        ? 'border-emerald-400 ring-1 ring-emerald-300 dark:border-emerald-600'
                        : 'border-slate-200/90 dark:border-slate-800'
                    }`}
                  >
                    {/* Header Row: Order Number + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-brand-600 dark:text-gold-400">
                          {o.name}
                        </span>
                        {newOrderIds.includes(o.id) && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse">
                            {isAr ? 'جديد' : 'NEW'}
                          </span>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusMeta.color}`}>
                        {isAr ? statusMeta.labelAr : statusMeta.labelEn}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {o.customerName || (isAr ? 'عميل بدون اسم' : 'Unnamed Customer')}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{o.customerPhone || '-'}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {o.date?.slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Badges: Delivery & Payment Status */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {o.deliveryType === 'delivery' || o.deliveryType === 'address'
                          ? (isAr ? 'توصيل مبرد' : 'Home Delivery')
                          : (isAr ? 'استلام فرع' : 'Pickup')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isPaid ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                      </span>
                      <span className="text-slate-400 font-medium text-[10px]">
                        {o.paymentMethod || 'Cash'}
                      </span>
                    </div>

                    {/* Footer Row: Total & Touch-Friendly Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                        {o.total} <span className="text-[11px] font-normal text-slate-400">{isAr ? 'ر.س' : 'SAR'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInvoiceOrderId(o.id);
                            setInvoiceModalOpen(true);
                          }}
                          className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                          <Printer size={14} />
                          <span>{isAr ? 'فاتورة' : 'Invoice'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="min-h-[44px] px-3.5 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-brand-700 transition shadow-xs"
                        >
                          <Eye size={14} />
                          <span>{isAr ? 'تفاصيل' : 'Details'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Data Table (Visible on screens md and up) */}
          <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'رقم الطلب' : 'Order Ref'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'طريقة الاستلام' : 'Delivery'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'طريقة الدفع' : 'Payment Method'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'حالة الدفع' : 'Payment Status'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'حالة الطلب' : 'Status'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الإجمالي' : 'Total'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        {isAr ? 'لا توجد طلبات مطابقة للفلتر المحدد' : 'No matching orders found'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const statusMeta = getStatusMeta(o.state);

                      return (
                        <tr
                          key={o.id}
                          onClick={() => {
                            setSelectedOrder(o);
                            clearNewBadge(o.id);
                          }}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                            newOrderIds.includes(o.id) ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-black text-brand-600 dark:text-gold-400">
                            <div className="flex items-center gap-2">
                              <span>{o.name}</span>
                              {newOrderIds.includes(o.id) && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse flex items-center gap-1 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                  {isAr ? 'جديد' : 'NEW'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 dark:text-slate-100">{o.customerName || '-'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{o.customerPhone || '-'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {o.date?.replace('T', ' ').slice(0, 16) || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-700 dark:text-slate-300">
                              {o.deliveryType === 'delivery' || o.deliveryType === 'address' ? (isAr ? 'توصيل مبرد' : 'Delivery') : isAr ? 'استلام فرع' : 'Pickup'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {o.paymentMethod || 'Cash on Delivery'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                o.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}
                            >
                              {o.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : isAr ? 'غير مدفوع' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusMeta.color}`}>
                              {isAr ? statusMeta.labelAr : statusMeta.labelEn}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                            {o.total} <span className="text-[10px] font-normal text-slate-400">{isAr ? 'ر.س' : 'SAR'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInvoiceOrderId(o.id);
                                  setInvoiceModalOpen(true);
                                }}
                                className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition cursor-pointer flex items-center justify-center"
                                title={isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(o);
                                }}
                                className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                                title={isAr ? 'عرض التفاصيل الكاملة' : 'View Details'}
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-Over Comprehensive Order Details Drawer/Modal (Requested by User) ────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-s border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-gold-400 flex items-center justify-center font-bold shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono truncate">
                      {selectedOrder.name}
                    </h3>
                    <button
                      onClick={() => handleCopy(selectedOrder.name)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 transition shrink-0"
                      title="نسخ رقم الطلب"
                    >
                      {copiedRef === selectedOrder.name ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedOrder.date?.replace('T', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceOrderId(selectedOrder.id);
                    setInvoiceModalOpen(true);
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition cursor-pointer"
                  title={isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">{isAr ? 'طباعة الفاتورة' : 'Print'}</span>
                </button>
                <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getStatusMeta(selectedOrder.state).color}`}>
                  {isAr ? getStatusMeta(selectedOrder.state).labelAr : getStatusMeta(selectedOrder.state).labelEn}
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                  aria-label={isAr ? 'إغلاق' : 'Close'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {loadingDetails ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                  <p className="text-xs font-medium">{isAr ? 'جاري تحميل تفاصيل الذبائح والطلب من أودو...' : 'Fetching order details from Odoo...'}</p>
                </div>
              ) : (
                <>
                  {/* Status Actions Stepper */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isAr ? 'تغيير حالة مسار الطلب فورياً:' : 'Update Order Stage:'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                        disabled={updatingId === selectedOrder.id}
                        className={`p-2 rounded-xl font-bold border transition cursor-pointer ${
                          selectedOrder.state === 'confirmed'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        {isAr ? '1. تأكيد الطلب' : '1. Confirm'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                        disabled={updatingId === selectedOrder.id}
                        className={`p-2 rounded-xl font-bold border transition cursor-pointer ${
                          selectedOrder.state === 'preparing'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {isAr ? '2. بدء الذبح والتجهيز' : '2. Butcher'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'out_delivery')}
                        disabled={updatingId === selectedOrder.id}
                        className={`p-2 rounded-xl font-bold border transition cursor-pointer ${
                          selectedOrder.state === 'out_delivery'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 hover:bg-cyan-100'
                        }`}
                      >
                        {isAr ? '3. خروج للتوصيل' : '3. Dispatch'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                        disabled={updatingId === selectedOrder.id}
                        className={`p-2 rounded-xl font-bold border transition cursor-pointer ${
                          selectedOrder.state === 'delivered'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {isAr ? '4. تم التسليم' : '4. Delivered'}
                      </button>
                    </div>
                  </div>

                  {/* Customer Information with Quick Contact */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <User size={14} className="text-brand-600" />
                        {isAr ? 'بيانات العميل' : 'Customer Details'}
                      </h4>
                      {orderDetails?.customerPhone && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/966${orderDetails.customerPhone.replace(/\D/g, '').replace(/^0/, '').replace(/^966/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100"
                          >
                            <MessageSquare size={12} />
                            WhatsApp
                          </a>
                          <a
                            href={`tel:${orderDetails.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 hover:bg-blue-100"
                          >
                            <Phone size={12} />
                            {isAr ? 'اتصال' : 'Call'}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'اسم العميل' : 'Name'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {orderDetails?.customerName || orderDetails?.customer?.name || (isAr ? 'غير مسجل' : 'N/A')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'رقم الجوال' : 'Phone'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                          {orderDetails?.customerPhone || orderDetails?.customer?.phone || '-'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300 font-mono">
                          {orderDetails?.customerEmail || orderDetails?.customer?.email || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Location & Address (Requested by User) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin size={14} className="text-brand-600" />
                      {isAr ? 'مكان التوصيل وطريقة الاستلام' : 'Delivery & Location'}
                    </h4>
                    <div className="text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">{isAr ? 'طريقة الاستلام:' : 'Method:'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {orderDetails?.deliveryType === 'delivery' || orderDetails?.deliveryType === 'address'
                            ? (isAr ? 'توصيل منزلي بسيارة مبردة' : 'Refrigerated Home Delivery')
                            : isAr ? 'استلام من الفرع' : 'Pickup from Branch'}
                        </span>
                      </div>
                      {orderDetails?.shippingAddress ? (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-100 dark:border-slate-800">
                          {orderDetails.shippingAddress}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-[11px] italic">
                          {isAr ? 'العنوان: الرياض - المملكة العربية السعودية' : 'Location: Riyadh, Saudi Arabia'}
                        </p>
                      )}
                      {orderDetails?.branchName && (
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                          <span className="text-slate-400">{isAr ? 'الفرع المسؤول:' : 'Branch:'}</span>
                          <span className="font-bold">{orderDetails.branchName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items & Slaughter Preparation Details (Requested by User) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Package size={14} className="text-brand-600" />
                        {isAr ? 'الذبائح والمنتجات المطلوبة' : 'Order Items & Options'}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {orderDetails?.lines?.length || selectedOrder.itemCount} {isAr ? 'عناصر' : 'items'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {orderDetails?.lines && orderDetails.lines.length > 0 ? (
                        orderDetails.lines.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                              <span>{item.name}</span>
                              <span className="text-brand-600 dark:text-gold-400">
                                {item.priceSubtotal || (item.priceUnit * item.quantity)} {isAr ? 'ر.س' : 'SAR'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>
                                {isAr ? 'الكمية:' : 'Qty:'} {item.quantity} × {item.priceUnit} {isAr ? 'ر.س' : 'SAR'}
                              </span>
                              {item.discount > 0 && (
                                <span className="text-rose-500 font-bold">
                                  {isAr ? 'خصم:' : 'Discount:'} {item.discount}%
                                </span>
                              )}
                            </div>

                            {/* Butchery Customization Options */}
                            {(item.size_name || item.cuttingOption || item.packaging || (item.excludedParts && item.excludedParts.length > 0)) && (
                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5 text-[10px]">
                                {item.size_name && (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold">
                                    {isAr ? 'الحجم:' : 'Size:'} {item.size_name}
                                    {item.size_price > 0 ? ` (${item.size_price} ${isAr ? 'ر.س' : 'SAR'})` : ''}
                                  </span>
                                )}
                                {item.cuttingOption && (
                                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold">
                                    {isAr ? 'التقطيع:' : 'Cut:'} {typeof item.cuttingOption === 'object' ? item.cuttingOption.name : item.cuttingOption}
                                    {item.cutting_price > 0 ? ` (+${item.cutting_price} ${isAr ? 'ر.س' : 'SAR'})` : ''}
                                  </span>
                                )}
                                {item.packaging && (
                                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold">
                                    {isAr ? 'التغليف:' : 'Pack:'} {typeof item.packaging === 'object' ? item.packaging.name : item.packaging}
                                    {item.packaging_price > 0 ? ` (+${item.packaging_price} ${isAr ? 'ر.س' : 'SAR'})` : ''}
                                  </span>
                                )}
                                {item.excludedParts && item.excludedParts.length > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold">
                                    {isAr ? 'بدون:' : 'Without:'}{' '}
                                    {item.excludedParts.map((p: any) => (typeof p === 'object' ? p.name : p)).join('، ')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 text-center">
                          {isAr ? 'طلب ذبيحة معتمدة مسبقاً' : 'Registered carcass items'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment & Financial Breakdown (Requested by User) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-brand-600" />
                      {isAr ? 'تفاصيل الدفع والحساب' : 'Payment & Pricing Breakdown'}
                    </h4>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{isAr ? 'طريقة وبوابة الدفع:' : 'Payment Method & Provider:'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {orderDetails?.paymentMethod || selectedOrder.paymentMethod || 'Moyasar'}
                        </span>
                      </div>
                      {(orderDetails?.slaughterDate || (selectedOrder as any).slaughterDate) && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{isAr ? 'موعد الذبح والتجهيز:' : 'Slaughter Schedule:'}</span>
                          <span className="font-bold text-primary-600 dark:text-primary-400 font-mono">
                            {orderDetails?.slaughterDate || (selectedOrder as any).slaughterDate}{' '}
                            {orderDetails?.slaughterTime || (selectedOrder as any).slaughterTime || ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{isAr ? 'حالة الدفع:' : 'Payment Status:'}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            selectedOrder.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {selectedOrder.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : isAr ? 'غير مدفوع' : 'Unpaid'}
                        </span>
                      </div>

                      {orderDetails?.subtotal > 0 && (
                        <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                          <span>{orderDetails.subtotal} {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                      )}

                      {orderDetails?.loyaltyDiscountAmount > 0 && (
                        <div className="flex items-center justify-between text-amber-600 font-bold">
                          <span>{isAr ? 'خصم نقاط الولاء:' : 'Loyalty Discount:'}</span>
                          <span>
                            - {orderDetails.loyaltyDiscountAmount} {isAr ? 'ر.س' : 'SAR'}
                            {orderDetails.pointsRedeemed > 0 ? ` (${orderDetails.pointsRedeemed} ${isAr ? 'نقطة' : 'pts'})` : ''}
                          </span>
                        </div>
                      )}

                      {orderDetails?.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-rose-500">
                          <span>{isAr ? 'خصم الكوبون / العرض:' : 'Coupon Discount:'}</span>
                          <span>- {orderDetails.discountAmount} {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                      )}

                      {/* Delivery fee line removed completely per business requirement */}

                      {orderDetails?.taxAmount > 0 && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{isAr ? 'ضريبة القيمة المضافة:' : 'VAT (15%):'}</span>
                          <span>{orderDetails.taxAmount} {isAr ? 'ر.س' : 'SAR'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {orderDetails?.notes && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-bold block mb-1">{isAr ? 'ملاحظات العميل:' : 'Customer Notes:'}</span>
                      <p>{orderDetails.notes}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {orderDetails?.timeline && orderDetails.timeline.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Clock size={14} className="text-brand-600" />
                        {isAr ? 'سجل تتبع الحالات (Timeline)' : 'Order Activity Log'}
                      </h4>
                      <div className="space-y-2 text-xs">
                        {orderDetails.timeline.map((event: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 text-[11px]">
                            <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{event.description}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{event.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'المبلغ النهائي الصافي' : 'Final Total'}</span>
                <span className="text-lg sm:text-xl font-black text-brand-600 dark:text-gold-400">
                  {selectedOrder.total} {isAr ? 'ر.س' : 'SAR'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceOrderId(selectedOrder.id);
                    setInvoiceModalOpen(true);
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white transition shadow-sm cursor-pointer"
                >
                  <Printer size={14} />
                  <span>{isAr ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="min-h-[44px] px-5 py-2 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition cursor-pointer flex items-center justify-center"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Printing Modal */}
      {invoiceModalOpen && invoiceOrderId && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          orderId={invoiceOrderId}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};
