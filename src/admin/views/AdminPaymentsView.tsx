import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Banknote,
  AlertCircle,
  ExternalLink,
  Layers,
  Clock,
  ArrowDownToLine,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  FileText,
  Copy,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { adminApi, AdminPaymentTransaction, MoyasarSettings } from '../api/adminApi';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useUIStore } from '../../store/useUIStore';

interface PaymentMethodItem {
  id: number;
  name: string;
  code: string;
  paymentType: string;
  provider: string;
  isInstallment: boolean;
  maxInstallments: number;
  description: string;
  isActive: boolean;
}

export const AdminPaymentsView: React.FC = () => {
  const { language, isRTL } = useLanguageStore();
  const { addToast } = useUIStore();
  const isAr = language === 'ar';

  // Subtab: 'requests' | 'methods' | 'gateway'
  const [activeTab, setActiveTab] = useState<'requests' | 'methods' | 'gateway'>('requests');

  // Transactions state
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txSearch, setTxSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<AdminPaymentTransaction | null>(null);

  // Methods state
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [methodSearch, setMethodSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'moyasar' | 'cash'>('all');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Moyasar Gateway Settings state
  const [moyasarSettings, setMoyasarSettings] = useState<MoyasarSettings>({
    isEnabled: true,
    isTestMode: true,
    livePublishableKey: '',
    liveSecretKey: '',
    testPublishableKey: 'pk_test_sample_live_ready_key',
    testSecretKey: '',
    webhookSecret: '',
    supportedMethods: ['mada', 'apple_pay', 'card', 'stc_pay'],
  });
  const [savingMoyasar, setSavingMoyasar] = useState(false);
  const [loadingMoyasar, setLoadingMoyasar] = useState(false);

  // Method Add/Edit Modal
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodItem | null>(null);
  const [mName, setMName] = useState('');
  const [mCode, setMCode] = useState('');
  const [mType, setMType] = useState('card');
  const [mProvider, setMProvider] = useState('moyasar');
  const [mDesc, setMDesc] = useState('');
  const [mIsInstallment, setMIsInstallment] = useState(false);
  const [mMaxInstallments, setMMaxInstallments] = useState(4);
  const [mActive, setMActive] = useState(true);
  const [savingMethod, setSavingMethod] = useState(false);

  // Load Transactions
  const loadTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await adminApi.getPaymentTransactions();
      setTransactions(res.transactions || []);
    } catch {
      addToast({
        type: 'error',
        message: isAr ? 'فشل تحميل طلبات ومعاملات الدفع' : 'Failed to load payment transactions',
      });
    } finally {
      setLoadingTx(false);
    }
  };

  // Load Methods (filtered to exclude unsupported / deprecated MyFatoorah)
  const loadMethods = async () => {
    setLoadingMethods(true);
    try {
      const res = await adminApi.getPaymentMethods();
      const raw = res?.paymentMethods || [];
      const clean = raw.filter((m: any) => m.code !== 'myfatoorah' && m.provider !== 'myfatoorah');
      setMethods(clean);
    } catch {
      addToast({
        type: 'error',
        message: isAr ? 'فشل تحميل طرق وبوابات الدفع' : 'Failed to load payment methods',
      });
    } finally {
      setLoadingMethods(false);
    }
  };

  // Load Moyasar Settings
  const loadMoyasarSettings = async () => {
    setLoadingMoyasar(true);
    try {
      const s = await adminApi.getMoyasarSettings();
      setMoyasarSettings(s);
    } catch {
      // Keep defaults
    } finally {
      setLoadingMoyasar(false);
    }
  };

  const handleSaveMoyasar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMoyasar(true);
    try {
      await adminApi.updateMoyasarSettings(moyasarSettings);
      addToast({
        type: 'success',
        message: isAr ? 'تم حفظ وتحديث إعدادات بوابة ميسر (Moyasar) بنجاح' : 'Moyasar settings saved successfully',
      });
    } catch {
      addToast({
        type: 'error',
        message: isAr ? 'فشل حفظ إعدادات بوابة ميسر' : 'Failed to save Moyasar settings',
      });
    } finally {
      setSavingMoyasar(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadMethods();
    loadMoyasarSettings();
  }, []);

  // Toggle method active status
  const handleToggle = async (item: PaymentMethodItem) => {
    setTogglingId(item.id);
    const nextState = !item.isActive;
    try {
      await adminApi.togglePaymentMethod(item.id, nextState);
      setMethods((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, isActive: nextState } : m))
      );
      addToast({
        type: 'success',
        message: isAr
          ? `تم ${nextState ? 'تفعيل' : 'تعطيل'} وسيلة الدفع (${item.name})`
          : `Payment method ${nextState ? 'activated' : 'deactivated'}`,
      });
    } catch {
      addToast({
        type: 'error',
        message: isAr ? 'فشل تحديث حالة وسيلة الدفع' : 'Failed to update payment status',
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Open Method Modal
  const openMethodModal = (method?: PaymentMethodItem) => {
    if (method) {
      setEditingMethod(method);
      setMName(method.name);
      setMCode(method.code);
      setMType(method.paymentType);
      setMProvider(method.provider);
      setMDesc(method.description || '');
      setMIsInstallment(method.isInstallment);
      setMMaxInstallments(method.maxInstallments || 4);
      setMActive(method.isActive);
    } else {
      setEditingMethod(null);
      setMName('');
      setMCode('');
      setMType('card');
      setMProvider('moyasar');
      setMDesc('');
      setMIsInstallment(false);
      setMMaxInstallments(4);
      setMActive(true);
    }
    setMethodModalOpen(true);
  };

  // Save Method
  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim() || !mCode.trim()) {
      addToast({
        type: 'error',
        message: isAr ? 'يرجى إدخال اسم وكود وسيلة الدفع' : 'Name and code are required',
      });
      return;
    }
    setSavingMethod(true);
    try {
      const payload: any = {
        name: mName.trim(),
        code: mCode.trim().toLowerCase(),
        payment_type: mType,
        provider: mProvider,
        description: mDesc.trim(),
        is_installment: mIsInstallment,
        max_installments: mIsInstallment ? mMaxInstallments : 0,
        active: mActive,
        is_active: mActive,
      };

      if (editingMethod) {
        await adminApi.updatePaymentMethod(editingMethod.id, payload);
        addToast({
          type: 'success',
          message: isAr ? 'تم تحديث وسيلة الدفع بنجاح' : 'Payment method updated',
        });
      } else {
        await adminApi.createPaymentMethod(payload);
        addToast({
          type: 'success',
          message: isAr ? 'تمت إضافة وسيلة الدفع بنجاح' : 'Payment method created',
        });
      }
      setMethodModalOpen(false);
      await loadMethods();
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isAr ? 'فشل حفظ وسيلة الدفع' : 'Failed to save');
      addToast({ type: 'error', message: msg });
    } finally {
      setSavingMethod(false);
    }
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (txSearch.trim()) {
        const q = txSearch.toLowerCase().trim();
        const mOrder = (tx.order_name || tx.order_number || '').toLowerCase().includes(q);
        const mCust = (tx.customer_name || '').toLowerCase().includes(q);
        const mPhone = (tx.customer_phone || '').toLowerCase().includes(q);
        const mRef = (tx.transaction_ref || '').toLowerCase().includes(q);
        const mMethod = (tx.payment_method_name || '').toLowerCase().includes(q);
        const mAmount = String(tx.amount).includes(q);
        return mOrder || mCust || mPhone || mRef || mMethod || mAmount;
      }
      return true;
    });
  }, [transactions, statusFilter, txSearch]);

  // Transaction Stats
  const totalTxCount = transactions.length;
  const paidTx = transactions.filter((t) => t.status === 'paid');
  const paidTxCount = paidTx.length;
  const paidTotalAmount = paidTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const pendingTxCount = transactions.filter((t) => t.status === 'pending').length;
  const refundedTxCount = transactions.filter((t) => t.status === 'refunded' || t.status === 'failed').length;

  // Filtered Methods
  const filteredMethods = useMemo(() => {
    return methods.filter((m) => {
      const query = methodSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.code.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query);

      const matchesProvider =
        providerFilter === 'all' ||
        (providerFilter === 'cash' && m.paymentType === 'cash') ||
        m.provider.toLowerCase().includes(providerFilter);

      return matchesSearch && matchesProvider;
    });
  }, [methods, methodSearch, providerFilter]);

  const activeMethodsCount = methods.filter((m) => m.isActive).length;

  // Helpers
  const getMethodIcon = (code: string, type: string) => {
    const c = (code || '').toLowerCase();
    if (c.includes('apple')) return Smartphone;
    if (c.includes('card') || c.includes('visa') || c.includes('master') || c.includes('mada')) return CreditCard;
    if (c.includes('wallet') || c.includes('stc')) return Wallet;
    if (type === 'cash' || c.includes('cod')) return Banknote;
    return CreditCard;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 size={12} className="stroke-[2.5]" />
            <span>{isAr ? 'مكتمل وسدد' : 'Paid'}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <Clock size={12} className="stroke-[2.5]" />
            <span>{isAr ? 'قيد الانتظار' : 'Pending'}</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
            <Receipt size={12} className="stroke-[2.5]" />
            <span>{isAr ? 'مسترد للعميل' : 'Refunded'}</span>
          </span>
        );
      case 'failed':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <XCircle size={12} className="stroke-[2.5]" />
            <span>{isAr ? 'فشل أو ملغي' : 'Failed'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span>{status}</span>
          </span>
        );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'info',
      message: isAr ? 'تم نسخ المرجع البنكي' : 'Reference copied to clipboard',
    });
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'سجل عمليات وطلبات الدفع وبوابات السداد' : 'Payment Requests & Gateways'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {isAr
              ? 'متابعة وتدقيق طلبات الدفع الإلكتروني المباشرة، وحالات المعاملات وبوابات الدفع (ميسر، أبل باي، مدى)'
              : 'Monitor real-time payment transactions, gateway statuses, and merchant settings'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'methods' && (
            <button
              onClick={() => openMethodModal()}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-xs cursor-pointer transition"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>{isAr ? 'إضافة وسيلة دفع' : 'Add Method'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'requests') loadTransactions();
              else loadMethods();
            }}
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs shrink-0"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loadingTx || loadingMethods ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-max">
          <button
            onClick={() => setActiveTab('requests')}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Receipt size={16} />
            <span>{isAr ? 'سجل طلبات ومعاملات الدفع' : 'Payment Requests & Logs'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400">
              {totalTxCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('methods')}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'methods'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CreditCard size={16} />
            <span>{isAr ? 'طرق وبوابات الدفع الإلكتروني' : 'Payment Gateways'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {methods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'gateway'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={16} />
            <span>{isAr ? 'إعدادات ميسر (Moyasar)' : 'Moyasar Gateway'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
              {moyasarSettings.isTestMode ? (isAr ? 'تجريبي' : 'Test') : (isAr ? 'حي' : 'Live')}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Payment Requests & Transactions */}
      {activeTab === 'requests' && (
        <div className="space-y-4 sm:space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'إجمالي طلبات السداد' : 'Total Requests'}
                </p>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalTxCount}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {isAr ? 'مسجلة في النظام' : 'Logged in database'}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'المعاملات المسددة بنجاح' : 'Paid Transactions'}
                </p>
                <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{paidTxCount}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 truncate">
                  {paidTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'قيد الانتظار والمعالجة' : 'Pending Payments'}
                </p>
                <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingTxCount}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {isAr ? 'في انتظار استجابة البوابة' : 'Awaiting gateway'}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'المستردة أو الملغاة' : 'Refunded / Failed'}
                </p>
                <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{refundedTxCount}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {isAr ? 'استرداد أو عملية ملغاة' : 'Refunds / Rejections'}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder={
                    isAr
                      ? 'بحث برقم الطلب، العميل، الهاتف، أو المرجع البنكي...'
                      : 'Search by order #, customer, phone, ref...'
                  }
                  className="w-full min-h-[44px] ps-9 pe-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', label: isAr ? 'جميع المعاملات' : 'All' },
                  { id: 'paid', label: isAr ? 'مدفوعة وناجحة' : 'Paid' },
                  { id: 'pending', label: isAr ? 'قيد الانتظار' : 'Pending' },
                  { id: 'refunded', label: isAr ? 'مستردة' : 'Refunded' },
                  { id: 'failed', label: isAr ? 'فاشلة / ملغاة' : 'Failed' },
                ].map((s) => {
                  const isActive = statusFilter === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStatusFilter(s.id)}
                      className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center justify-center ${
                        isActive
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DUAL VIEW FOR TRANSACTIONS: MOBILE CARDS VIEW (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {loadingTx ? (
              <div className="py-16 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800">
                <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-primary-600" />
                <span>{isAr ? 'جارٍ تحميل سجل معاملات الدفع من Odoo...' : 'Loading transactions...'}</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-16 text-center text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <span>{isAr ? 'لا توجد طلبات أو معاملات دفع تطابق البحث' : 'No transactions found'}</span>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const Icon = getMethodIcon(tx.payment_method_code, '');
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 cursor-pointer hover:border-primary-500/30 transition"
                  >
                    {/* Top Row: Order # and Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono font-black text-primary-600 dark:text-primary-400 text-xs">
                        <Receipt size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{tx.order_name || tx.order_number || `#${tx.order_id}`}</span>
                      </div>
                      <div className="shrink-0">{getStatusBadge(tx.status)}</div>
                    </div>

                    {/* Middle Row: Customer Info & Amount */}
                    <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                          {tx.customer_name}
                        </div>
                        {tx.customer_phone && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5" dir="ltr">
                            {tx.customer_phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="size-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                            <Icon size={11} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {tx.payment_method_name}
                          </span>
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{tx.currency || 'ر.س'}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Reference & Date & Action */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] truncate max-w-[140px]" title={tx.transaction_ref}>
                          {tx.transaction_ref}
                        </span>
                        {tx.transaction_ref && tx.transaction_ref !== '-' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(tx.transaction_ref);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                            title={isAr ? 'نسخ المرجع' : 'Copy'}
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px]">{formatDate(tx.paid_date || tx.create_date)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DUAL VIEW FOR TRANSACTIONS: DESKTOP TABLE VIEW (hidden md:block) */}
          <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 text-start">{isAr ? 'رقم الطلب' : 'Order #'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'طريقة الدفع' : 'Payment Method'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'المرجع البنكي' : 'Reference'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ المعاملة' : 'Date'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'إجراء' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {loadingTx ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-xs font-bold text-slate-400">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-primary-600" />
                        <span>{isAr ? 'جارٍ تحميل سجل معاملات الدفع من Odoo...' : 'Loading transactions...'}</span>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-xs font-bold text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <span>{isAr ? 'لا توجد طلبات أو معاملات دفع تطابق البحث' : 'No transactions found'}</span>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const Icon = getMethodIcon(tx.payment_method_code, '');

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                          onClick={() => setSelectedTx(tx)}
                        >
                          {/* Order Number */}
                          <td className="py-3.5 px-4 font-mono font-black text-primary-600 dark:text-primary-400 whitespace-nowrap">
                            <span className="hover:underline flex items-center gap-1.5">
                              <Receipt size={14} className="text-slate-400" />
                              <span>{tx.order_name || tx.order_number || `#${tx.order_id}`}</span>
                            </span>
                          </td>

                          {/* Customer Name & Phone */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{tx.customer_name}</div>
                            {tx.customer_phone && (
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5">{tx.customer_phone}</div>
                            )}
                          </td>

                          {/* Payment Method */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                <Icon size={14} />
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                  {tx.payment_method_name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 uppercase">
                                  {tx.payment_method_code}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900 dark:text-slate-100">
                            {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-[10px] font-normal text-slate-500">{tx.currency || 'ر.س'}</span>
                          </td>

                          {/* Transaction Reference */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="max-w-[130px] truncate" title={tx.transaction_ref}>
                                {tx.transaction_ref}
                              </span>
                              {tx.transaction_ref && tx.transaction_ref !== '-' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(tx.transaction_ref);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                  title={isAr ? 'نسخ المرجع' : 'Copy'}
                                >
                                  <Copy size={12} />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                            {formatDate(tx.paid_date || tx.create_date)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title={isAr ? 'عرض التفاصيل' : 'View details'}
                            >
                              <Eye size={15} />
                            </button>
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

      {/* TAB 2: Payment Gateways & Methods */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'إجمالي وسائل الدفع' : 'Total Gateways'}
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{methods.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'المفعلة للعملاء بالسداد' : 'Active Gateways'}
                </p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeMethodsCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'بوابة ميسر (Moyasar)' : 'Moyasar Gateways'}
                </p>
                <p className="text-xl font-black text-primary-600 dark:text-primary-400 mt-1">
                  {methods.filter((m) => m.provider.toLowerCase().includes('moyasar')).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isAr ? 'معايير الأمان والتشفير' : 'Security Level'}
                </p>
                <p className="text-base font-black text-slate-900 dark:text-slate-100 mt-1.5 font-mono">PCI-DSS 3.2</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                <input
                  type="text"
                  value={methodSearch}
                  onChange={(e) => setMethodSearch(e.target.value)}
                  placeholder={
                    isAr ? 'ابحث باسم طريقة الدفع، الكود، أو المزود...' : 'Search by name, code, or provider...'
                  }
                  className="w-full ps-9 pe-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: isAr ? 'جميع الوسائل' : 'All Methods' },
                  { id: 'moyasar', label: isAr ? 'ميسر (Moyasar)' : 'Moyasar' },
                  { id: 'cash', label: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery' },
                ].map((tab: any) => {
                  const isActive = providerFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProviderFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Methods Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMethods ? (
              <div className="col-span-full py-16 text-center text-xs font-bold text-slate-400">
                <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-primary-600" />
                <span>{isAr ? 'جارٍ تحميل طرق وبوابات الدفع من Odoo...' : 'Loading payment gateways...'}</span>
              </div>
            ) : filteredMethods.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs font-bold text-slate-400">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <span>{isAr ? 'لا توجد وسائل دفع تطابق البحث' : 'No payment methods found'}</span>
              </div>
            ) : (
              filteredMethods.map((pm) => {
                const Icon = getMethodIcon(pm.code, pm.paymentType);
                const isToggling = togglingId === pm.id;

                return (
                  <div
                    key={pm.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary-500/30 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{pm.name}</h3>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{pm.code}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            pm.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {pm.isActive ? (isAr ? 'مفعل' : 'Active') : isAr ? 'معطل' : 'Inactive'}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">{isAr ? 'مزود البوابة:' : 'Gateway Provider:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{pm.provider}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">{isAr ? 'نوع المعاملة:' : 'Transaction Type:'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{pm.paymentType}</span>
                        </div>

                        {pm.isInstallment && (
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">{isAr ? 'خطة التقسيط:' : 'Installment Plan:'}</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {pm.maxInstallments} {isAr ? 'دفعات' : 'installments'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => openMethodModal(pm)}
                        className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={isAr ? 'تعديل وسيلة الدفع' : 'Edit'}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleToggle(pm)}
                        disabled={isToggling}
                        className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                          pm.isActive
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
                        }`}
                      >
                        {isToggling && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>{pm.isActive ? (isAr ? 'تعطيل' : 'Deactivate') : isAr ? 'تفعيل' : 'Activate'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Moyasar Gateway Configuration */}
      {activeTab === 'gateway' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs max-w-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {isAr ? 'إعدادات وتكوين بوابة ميسر (Moyasar Payment Gateway)' : 'Moyasar Gateway Configuration'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'بوابة الدفع الإلكتروني المعتمدة للربط مع مدى، البطاقات الائتمانية، أبل باي، وSTC Pay'
                    : 'Configure live and test API keys, webhook secret, and active channels'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  moyasarSettings.isTestMode
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {moyasarSettings.isTestMode
                  ? isAr
                    ? 'بيئة الاختبار (Sandbox)'
                    : 'Sandbox Mode'
                  : isAr
                  ? 'البيئة الحية (Production)'
                  : 'Production Live'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveMoyasar} className="space-y-5">
            {/* Environment Toggle & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between gap-3 cursor-pointer min-h-[44px]">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                    {isAr ? 'تفعيل بوابة ميسر' : 'Enable Moyasar'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isAr ? 'استقبال المدفوعات عبر ميسر في التطبيق والمتجر' : 'Accept online payments'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={moyasarSettings.isEnabled}
                  onChange={(e) => setMoyasarSettings({ ...moyasarSettings, isEnabled: e.target.checked })}
                  className="size-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer min-h-[44px]">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                    {isAr ? 'وضع الاختبار التجريبي (Test Sandbox)' : 'Test Mode (Sandbox)'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isAr ? 'استخدام مفاتيح الاختبار بدلاً من الحساب الحي' : 'Use test API keys'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={moyasarSettings.isTestMode}
                  onChange={(e) => setMoyasarSettings({ ...moyasarSettings, isTestMode: e.target.checked })}
                  className="size-5 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Test Keys */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>{isAr ? 'مفاتيح بيئة الاختبار (Test API Keys)' : 'Test API Credentials'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المفتاح العام التجريبي (Test Publishable Key)' : 'Test Publishable Key'}
                  </label>
                  <input
                    type="text"
                    value={moyasarSettings.testPublishableKey}
                    onChange={(e) => setMoyasarSettings({ ...moyasarSettings, testPublishableKey: e.target.value })}
                    placeholder="pk_test_..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المفتاح السري التجريبي (Test Secret Key)' : 'Test Secret Key'}
                  </label>
                  <input
                    type="password"
                    value={moyasarSettings.testSecretKey}
                    onChange={(e) => setMoyasarSettings({ ...moyasarSettings, testSecretKey: e.target.value })}
                    placeholder="sk_test_..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Keys */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>{isAr ? 'مفاتيح البيئة الحية (Live Production Keys)' : 'Live Production Credentials'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المفتاح العام الحي (Live Publishable Key)' : 'Live Publishable Key'}
                  </label>
                  <input
                    type="text"
                    value={moyasarSettings.livePublishableKey}
                    onChange={(e) => setMoyasarSettings({ ...moyasarSettings, livePublishableKey: e.target.value })}
                    placeholder="pk_live_..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المفتاح السري الحي (Live Secret Key)' : 'Live Secret Key'}
                  </label>
                  <input
                    type="password"
                    value={moyasarSettings.liveSecretKey}
                    onChange={(e) => setMoyasarSettings({ ...moyasarSettings, liveSecretKey: e.target.value })}
                    placeholder="sk_live_..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Webhook Settings */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{isAr ? 'إعدادات إشعارات الويب هوك (Webhook Settings)' : 'Webhook Configuration'}</span>
              </h4>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'مفتاح توقيع الويب هوك (Webhook Secret / Secret Token)' : 'Webhook Secret'}
                </label>
                <input
                  type="password"
                  value={moyasarSettings.webhookSecret}
                  onChange={(e) => setMoyasarSettings({ ...moyasarSettings, webhookSecret: e.target.value })}
                  placeholder={isAr ? 'أدخل الرمز السري للتحقق من إشعارات ميسر...' : 'Webhook secret token...'}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'رابط الويب هوك لاستقبال إشعارات السداد (Webhook URL)' : 'Webhook Endpoint URL'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/v1/payments/moyasar/webhook`}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-400 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/api/v1/payments/moyasar/webhook`)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition cursor-pointer shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={savingMoyasar}
                className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer disabled:opacity-50 transition"
              >
                {savingMoyasar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>
                  {savingMoyasar
                    ? isAr
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : isAr
                    ? 'حفظ إعدادات ميسر'
                    : 'Save Moyasar Settings'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                  {isAr ? 'تفاصيل معاملة الدفع' : 'Payment Details'} #{selectedTx.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">{isAr ? 'رقم الطلب:' : 'Order Number:'}</span>
                  <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm break-words">
                    {selectedTx.order_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">{isAr ? 'المبلغ الإجمالي:' : 'Amount:'}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {Number(selectedTx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    {selectedTx.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'اسم العميل:' : 'Customer Name:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedTx.customer_name}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'هاتف العميل:' : 'Customer Phone:'}</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100" dir="ltr">
                    {selectedTx.customer_phone || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'وسيلة الدفع:' : 'Payment Method:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedTx.payment_method_name} ({selectedTx.payment_method_code})
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'حالة السداد:' : 'Payment Status:'}</span>
                  <div>{getStatusBadge(selectedTx.status)}</div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'المرجع البنكي:' : 'Reference:'}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {selectedTx.transaction_ref}
                    </span>
                    {selectedTx.transaction_ref && selectedTx.transaction_ref !== '-' && (
                      <button
                        onClick={() => copyToClipboard(selectedTx.transaction_ref)}
                        className="p-1 rounded text-primary-600 hover:bg-primary-50 transition cursor-pointer"
                        title={isAr ? 'نسخ' : 'Copy'}
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'تاريخ السداد الفعلي:' : 'Paid Date:'}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(selectedTx.paid_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">{isAr ? 'تاريخ إنشاء الطلب:' : 'Created Date:'}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(selectedTx.create_date)}
                  </span>
                </div>

                {selectedTx.failure_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400">
                    <span className="font-bold block mb-0.5">{isAr ? 'سبب الفشل / الرفض:' : 'Failure Reason:'}</span>
                    <span>{selectedTx.failure_reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                onClick={() => setSelectedTx(null)}
                className="min-h-[44px] w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs cursor-pointer flex items-center justify-center"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Payment Method Modal */}
      {methodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                {editingMethod
                  ? isAr
                    ? 'تعديل وسيلة الدفع'
                    : 'Edit Payment Method'
                  : isAr
                  ? 'إضافة وسيلة دفع جديدة'
                  : 'Add Payment Method'}
              </h3>
              <button
                onClick={() => setMethodModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم وسيلة الدفع *' : 'Method Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder={isAr ? 'مثال: أبل باي (Apple Pay)' : 'e.g. Apple Pay'}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الكود التعريفي (Code) *' : 'Method Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMethod}
                    value={mCode}
                    onChange={(e) => setMCode(e.target.value)}
                    placeholder="apple_pay"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-mono disabled:opacity-50 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'مزود البوابة (Provider)' : 'Gateway Provider'}
                  </label>
                  <select
                    value={mProvider}
                    onChange={(e) => setMProvider(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="moyasar">Moyasar (ميسر)</option>
                    <option value="manual">Manual / COD (الدفع عند الاستلام)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'نوع المعاملة (Type)' : 'Payment Type'}
                  </label>
                  <select
                    value={mType}
                    onChange={(e) => setMType(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="card">Card (بطاقة مدى / فيزا / ماستر كارد)</option>
                    <option value="wallet">Digital Wallet (محفظة رقمية)</option>
                    <option value="installment">Installment (أقساط BNPL)</option>
                    <option value="cash">Cash on Delivery (دفع عند الاستلام)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'وصف وسيلة الدفع للعميل' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                  placeholder={isAr ? 'وصف إرشادي يظهر في شاشة إتمام الطلب...' : 'Checkout instructions...'}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-medium resize-none"
                />
              </div>

              <label className="flex items-center gap-3 pt-1 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  id="mActiveCheck"
                  checked={mActive}
                  onChange={(e) => setMActive(e.target.checked)}
                  className="size-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'تفعيل وسيلة الدفع فوراً للمتسوقين عند السداد' : 'Active & available at checkout'}
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMethodModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savingMethod}
                  className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-black bg-primary-600 hover:bg-primary-700 text-white shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {savingMethod ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : isAr ? 'حفظ وسيلة الدفع' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
