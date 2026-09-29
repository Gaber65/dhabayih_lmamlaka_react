import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Download, X, FileText, CheckCircle2, Building, User, Receipt, ShieldCheck } from 'lucide-react';
import { ordersApi } from '../../api/orders';
import { OrderDetail } from '../../types/order.types';

interface InvoiceModalProps {
  orderId: number;
  initialOrder?: OrderDetail;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  orderId,
  initialOrder,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'thermal' | 'a4'>('thermal');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.getInvoice(orderId);
        if (isMounted && data) {
          setInvoiceData(data);
          if (data.settings?.paper_format) {
            setFormat(data.settings.paper_format === 'a4' ? 'a4' : 'thermal');
          }
        }
      } catch (err) {
        console.error('Failed to load invoice from API, falling back to local order details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInvoice();
    return () => {
      isMounted = false;
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) {
      window.print();
      return;
    }

    // Remove any existing print iframe
    const oldIframe = document.getElementById('invoice-print-frame');
    if (oldIframe) oldIframe.remove();

    // Create an isolated iframe to cleanly render and print only the invoice
    const iframe = document.createElement('iframe');
    iframe.id = 'invoice-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = format === 'thermal' ? '80mm' : '800px';
    iframe.style.height = format === 'thermal' ? 'auto' : '1100px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Grab all current stylesheets so Tailwind styling is applied
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    const pageSizeCss =
      format === 'thermal'
        ? `@page { size: 80mm auto; margin: 2mm; } html, body { width: 75mm !important; margin: 0 auto !important; }`
        : `@page { size: A4 portrait; margin: 10mm; } html, body { width: 100% !important; margin: 0 !important; }`;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${t('simplified_tax_invoice', 'فاتورة ضريبية مبسطة')} - ${orderNumber}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        ${styleTags}
        <style>
          ${pageSizeCss}
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            visibility: visible !important;
          }
          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Cairo', 'Tajawal', sans-serif !important;
            padding: 0 !important;
            font-size: ${format === 'thermal' ? '11px' : '13px'} !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
        </style>
      </head>
      <body class="bg-white">
        <div id="printable-invoice" style="width: 100%; max-width: 100%; background: #ffffff;">
          ${printContent.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          iframe.remove();
        }
      }, 2000);
    }, 450);
  };

  const handleDownloadPdf = () => {
    const url = ordersApi.getInvoicePdfUrl(orderId, format);
    window.open(url, '_blank');
  };

  // Fallbacks if backend invoice object is still loading
  const orderNumber = invoiceData?.order_number || initialOrder?.name || `ORD-${orderId}`;
  const dateStr = invoiceData?.date || initialOrder?.date || new Date().toISOString();
  const seller = {
    name:
      !invoiceData?.seller?.name ||
      invoiceData.seller.name.includes('YourCompany') ||
      invoiceData.seller.name.includes('My Company')
        ? 'ذبائح المملكة'
        : invoiceData.seller.name,
    name_en: 'Dhabayih Lmamlaka',
    vat_number: invoiceData?.seller?.vat_number || '310198765400003',
    cr_number: invoiceData?.seller?.cr_number || '1010892341',
    phone: invoiceData?.seller?.phone || '0568741660',
    address: invoiceData?.seller?.address || 'المملكة العربية السعودية',
  };
  const customer = invoiceData?.customer || {
    name: 'عميلنا العزيز',
    phone: '-',
    shipping_address: 'العنوان المسجل للطلب',
    delivery_type: 'address',
  };
  const lines =
    invoiceData?.lines ||
    initialOrder?.lines?.map((l) => ({
      id: l.id,
      name: l.name,
      quantity: l.quantity,
      price_unit: l.priceUnit,
      price_subtotal: l.priceSubtotal,
      cutting_option: l.cuttingOption?.name,
      packaging: l.packaging?.name,
      excluded_parts: l.excludedParts?.map((p) => p.name) || [],
    })) ||
    [];

  const rawSubtotal = Number(invoiceData?.summary?.subtotal ?? initialOrder?.subtotal ?? 0);
  const rawTax = Number(invoiceData?.summary?.tax_amount ?? initialOrder?.taxAmount ?? 0);
  const taxAmount = rawTax > 0 ? rawTax : rawSubtotal > 0 ? Number((rawSubtotal * 0.15).toFixed(2)) : 0;

  const summary = {
    subtotal: rawSubtotal,
    discount_amount: Number(invoiceData?.summary?.discount_amount ?? initialOrder?.discountAmount ?? 0),
    loyalty_discount_amount: Number(
      invoiceData?.summary?.loyalty_discount_amount ?? initialOrder?.loyaltyDiscountAmount ?? 0
    ),
    tax_amount: taxAmount,
    delivery_fee: Number(invoiceData?.summary?.delivery_fee ?? 31.95),
    total: Number(invoiceData?.summary?.total ?? initialOrder?.total ?? 0),
  };

  const showLogo = invoiceData?.settings?.show_logo ?? true;
  const showQr = invoiceData?.settings?.show_qr ?? true;
  const headerNote = invoiceData?.settings?.header_note || 'ذبائح ولحوم بلدية طازجة وفق الشريعة الإسلامية';
  const footerNote = invoiceData?.settings?.footer_note || 'شكراً لتسوقكم من ذبائح المملكة | خدمة العملاء: 0568741660';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Card */}
      <div
        className={`relative w-full ${
          format === 'thermal' ? 'max-w-lg' : 'max-w-3xl'
        } bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col transition-all duration-300`}
      >
        {/* Action Header (Excluded in print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {t('simplified_tax_invoice', 'فاتورة ضريبية مبسطة')}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">{orderNumber}</p>
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl border border-slate-300 text-xs">
            <button
              type="button"
              onClick={() => setFormat('thermal')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                format === 'thermal'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>إيصال حراري (80mm)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('a4')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                format === 'a4'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ورقة A4 كاملة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print_invoice', 'طباعة')}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('download_pdf', 'تحميل PDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="printable-invoice" className="p-4 sm:p-6 overflow-y-auto text-slate-800 bg-white" dir="rtl">
          {format === 'thermal' ? (
            /* ================= 80MM THERMAL RECEIPT VIEW ================= */
            <div className="max-w-[340px] mx-auto bg-white p-4 font-sans text-xs text-slate-900 text-center leading-relaxed border border-dashed border-slate-300 rounded-2xl shadow-xs">
              {/* Logo */}
              {showLogo && (
                <div className="mb-2">
                  <img
                    src="/app_logo.png"
                    alt="ذبائح المملكة"
                    className="w-16 h-16 object-contain mx-auto"
                  />
                </div>
              )}
              <h1 className="text-base font-black text-slate-900">{seller.name}</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{headerNote}</p>

              <div className="border-t border-dashed border-slate-400 my-2.5" />

              <div className="text-xs font-extrabold text-slate-800">فاتورة ضريبية مبسطة</div>
              <div className="text-[10px] text-slate-500 font-mono">SIMPLIFIED TAX INVOICE</div>

              <div className="text-right text-[11px] space-y-1.5 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الفاتورة:</span>
                  <span className="font-mono font-bold">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">التاريخ:</span>
                  <span className="font-mono">{dateStr.replace('T', ' ').substring(0, 16)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الرقم الضريبي:</span>
                  <span className="font-mono font-bold">{seller.vat_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السجل التجاري:</span>
                  <span className="font-mono">{seller.cr_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">العميل:</span>
                  <span className="font-bold">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الجوال:</span>
                  <span className="font-mono">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">طريقة الدفع:</span>
                  <span>{invoiceData?.payment_method || initialOrder?.paymentMethod || 'دفع إلكتروني'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حالة السداد:</span>
                  <span className="text-emerald-700 font-bold">مدفوع بالكامل</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 my-2.5" />

              {/* Items Table */}
              <table className="w-full text-[11px] text-right">
                <thead>
                  <tr className="border-b border-slate-900 font-bold">
                    <th className="py-1.5 text-right">الصنف</th>
                    <th className="py-1.5 text-center">الكمية</th>
                    <th className="py-1.5 text-center">السعر</th>
                    <th className="py-1.5 text-left">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-slate-300">
                  {lines.map((line: any, idx: number) => (
                    <tr key={line.id || idx}>
                      <td className="py-1.5 text-right">
                        <div className="font-bold text-slate-900">{line.name}</div>
                        {line.size && (
                          <div className="text-[10px] text-teal-700 font-medium">حجم: {line.size}</div>
                        )}
                        {line.cutting_option && (
                          <div className="text-[10px] text-slate-500">✂️ {line.cutting_option}</div>
                        )}
                        {line.packaging && (
                          <div className="text-[10px] text-slate-500">📦 {line.packaging}</div>
                        )}
                        {line.excluded_parts && line.excluded_parts.length > 0 && (
                          <div className="text-[10px] text-amber-700">🚫 بدون: {line.excluded_parts.join(', ')}</div>
                        )}
                      </td>
                      <td className="py-1.5 text-center font-mono font-bold">{line.quantity}</td>
                      <td className="py-1.5 text-center font-mono">{Number(line.price_unit).toFixed(2)}</td>
                      <td className="py-1.5 text-left font-mono font-bold text-slate-900">
                        {Number(line.price_subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-slate-400 my-2.5" />

              {/* Totals Calculation */}
              <div className="text-right text-[11px] space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع غير شامل الضريبة:</span>
                  <span className="font-mono font-bold">{Number(summary.subtotal).toFixed(2)} ر.س</span>
                </div>
                {Number(summary.discount_amount) > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>الخصم:</span>
                    <span className="font-mono">- {Number(summary.discount_amount).toFixed(2)} ر.س</span>
                  </div>
                )}
                {Number(summary.loyalty_discount_amount) > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>خصم نقاط الولاء:</span>
                    <span className="font-mono">- {Number(summary.loyalty_discount_amount).toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono font-bold">{Number(summary.tax_amount).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>التوصيل:</span>
                  <span className="font-mono font-bold">
                    {Number(summary.delivery_fee) > 0
                      ? `${Number(summary.delivery_fee).toFixed(2)} ر.س`
                      : 'مجاني'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-black border-t-2 border-slate-900 pt-1.5 mt-1 text-slate-900">
                  <span>الإجمالي الكلي:</span>
                  <span className="font-mono text-base">{Number(summary.total).toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 my-3" />

              {/* ZATCA QR Code */}
              {showQr && (
                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="w-28 h-28 p-1 bg-white border border-slate-300 rounded-xl shadow-2xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                        invoiceData?.zatca_qr || orderNumber
                      )}`}
                      alt="ZATCA QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    فاتورة إلكترونية معتمدة - ZATCA QR
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className="text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200">
                <div className="font-bold text-slate-700">{footerNote}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">ذبائح بلدية طازجة 100% | مسالخ معتمدة</div>
              </div>
            </div>
          ) : (
            /* ================= FULL A4 SHEET VIEW ================= */
            <div>
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b-2 border-teal-600">
                <div>
                  <div className="flex items-center gap-2">
                    {showLogo && (
                      <img
                        src="/app_logo.png"
                        alt="ذبائح المملكة"
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <span className="text-2xl font-black text-teal-700">{seller.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-800 font-bold rounded-md border border-teal-200">
                      {seller.name_en}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">{headerNote}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">{t('vat_number_label', 'الرقم الضريبي')}:</span>
                      <span className="font-mono font-bold text-slate-900">{seller.vat_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">{t('cr_number_label', 'السجل التجاري')}:</span>
                      <span className="font-mono text-slate-800">{seller.cr_number}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Meta & ZATCA QR Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left">
                  <div className="text-right sm:text-left mb-2">
                    <div className="text-xs font-black text-teal-800 uppercase tracking-wide">
                      فاتورة ضريبية مبسطة
                    </div>
                    <div className="text-[10px] text-slate-500">SIMPLIFIED TAX INVOICE</div>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1">{orderNumber}</div>
                    <div className="text-[11px] text-slate-500">
                      {dateStr.replace('T', ' ').substring(0, 16)}
                    </div>
                  </div>

                  {showQr && (
                    <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 flex items-center justify-center shadow-2xs">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          invoiceData?.zatca_qr || orderNumber
                        )}`}
                        alt="ZATCA QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-black text-teal-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>بيانات العميل والاستلام</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الاسم:</span>
                    <span className="font-bold text-slate-900">{customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الجوال:</span>
                    <span className="font-mono font-bold text-slate-900">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">العنوان:</span>
                    <span className="text-slate-800 font-medium text-left max-w-[65%]">
                      {customer.shipping_address}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-black text-teal-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Building className="w-3.5 h-3.5" />
                    <span>طريقة وحالة السداد</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">طريقة الدفع:</span>
                    <span className="font-bold text-slate-900">
                      {invoiceData?.payment_method || initialOrder?.paymentMethod || 'دفع إلكتروني'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">حالة السداد:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مدفوع بالكامل</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">نوع التوصيل:</span>
                    <span className="font-medium text-slate-800">
                      {customer.delivery_type === 'pickup' ? 'استلام من الفرع' : 'توصيل مبرد للعنوان'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-xs text-right">
                  <thead className="bg-teal-700 text-white font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3">المنتج والتفاصيل</th>
                      <th className="py-2.5 px-3">خيارات التجهيز</th>
                      <th className="py-2.5 px-3 text-center">الكمية</th>
                      <th className="py-2.5 px-3 text-center">السعر</th>
                      <th className="py-2.5 px-3 text-center">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {lines.map((line: any, idx: number) => (
                      <tr key={line.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{line.name}</div>
                          {line.size && (
                            <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                              الحجم: {line.size}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600">
                          {line.cutting_option && <div>✂️ {line.cutting_option}</div>}
                          {line.packaging && <div>📦 {line.packaging}</div>}
                          {line.excluded_parts && line.excluded_parts.length > 0 && (
                            <div className="text-amber-700">🚫 بدون: {line.excluded_parts.join(', ')}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {line.quantity}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {Number(line.price_unit).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-teal-700">
                          {Number(line.price_subtotal).toFixed(2)} ر.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/60 text-xs text-teal-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-teal-800">
                    <ShieldCheck className="w-4 h-4" />
                    <span>إقرار الجودة والذبح الحلال</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    جميع الذبائح بلدية ومذبوحة ومجهزة في مسالخ أمانة منطقة الرياض بإشراف بيطري كامل، ومحمولة
                    بسيارات مبردة بدرجة أمان قصوى.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي (غير شامل الضريبة):</span>
                    <span className="font-mono font-bold">{Number(summary.subtotal).toFixed(2)} ر.س</span>
                  </div>
                  {Number(summary.discount_amount) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>خصم الكوبون / العرض:</span>
                      <span className="font-mono">- {Number(summary.discount_amount).toFixed(2)} ر.س</span>
                    </div>
                  )}
                  {Number(summary.loyalty_discount_amount) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>خصم نقاط الولاء:</span>
                      <span className="font-mono">
                        - {Number(summary.loyalty_discount_amount).toFixed(2)} ر.س
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span className="font-mono font-bold">{Number(summary.tax_amount).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>رسوم التوصيل المبرد:</span>
                    <span className="font-mono font-bold">
                      {Number(summary.delivery_fee) > 0
                        ? `${Number(summary.delivery_fee).toFixed(2)} ر.س`
                        : 'مجاني'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black border-t border-slate-200 pt-2 text-teal-700">
                    <span>الإجمالي الكلي المستحق:</span>
                    <span className="font-mono text-base">{Number(summary.total).toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="text-center border-t border-slate-100 pt-6 mt-6 text-[11px] text-slate-400">
                <div>{footerNote}</div>
                <div className="mt-1">هذه الفاتورة صادرة إلكترونياً وتعتبر وثيقة رسمية معتمدة</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
