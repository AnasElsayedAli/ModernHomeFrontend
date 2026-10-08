'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToccoStore } from '@/lib/store';
import { normalizeApiError } from '@/lib/api/errors';
import { EGYPTIAN_PHONE_ERROR, normalizeEgyptianPhone } from '@/lib/utils';
import { customDesignService } from '@/lib/api/services/customDesignService';
import { uploadDirectToCloudinary } from '@/lib/api/cloudinary';
import { toWhatsAppNumber } from '@/lib/utils';
import { CustomDesignRequestCreate, CustomDesignRequestType } from '@/types/customDesign';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';

interface CustomDesignRequestFormProps {
  requestType: CustomDesignRequestType;
}

const MAX_IMAGES = 10;

export default function CustomDesignRequestForm({ requestType }: CustomDesignRequestFormProps) {
  const { user } = useAuth();
  const { navigateTo, settings } = useToccoStore();
  const isBusiness = requestType === 'BUSINESS';
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingReferences, setIsUploadingReferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentWarning, setAttachmentWarning] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestLabel = isBusiness ? 'طلب مشروع أعمال' : 'طلب تصنيع حسب الطلب';

  useEffect(() => {
    if (submittedRequestId === null) return;
    const redirectTimer = window.setTimeout(() => navigateTo('home'), 5000);
    return () => window.clearTimeout(redirectTimer);
  }, [submittedRequestId, navigateTo]);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';
    const validFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== selectedFiles.length) {
      setError('اختر ملفات صور فقط.');
    } else {
      setError(null);
    }

    const nextFiles = [...images, ...validFiles];
    if (nextFiles.length > MAX_IMAGES) {
      setError(`يمكنك إرفاق ${MAX_IMAGES} صور كحد أقصى.`);
    }
    setImages(nextFiles.slice(0, MAX_IMAGES));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAttachmentWarning(null);

    const dimensions: CustomDesignRequestCreate['dimensions'] = {};
    if (width) dimensions.width_cm = Number(width);
    if (height) dimensions.height_cm = Number(height);
    if (depth) dimensions.depth_cm = Number(depth);
    if (Object.keys(dimensions).length === 0) {
      setError('أضف مقاسًا واحدًا على الأقل لمساعدتنا في فهم القطعة.');
      return;
    }

    const normalizedPhone = normalizeEgyptianPhone(contactPhone);
    if (!normalizedPhone) {
      setError(EGYPTIAN_PHONE_ERROR);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CustomDesignRequestCreate = {
        title: title.trim(),
        request_type: requestType,
        dimensions,
        quantity: Number(quantity),
        description: description.trim(),
        contact_phone: normalizedPhone,
        company_name: isBusiness ? companyName.trim() : '',
        project_location: projectLocation.trim(),
        target_delivery_date: targetDeliveryDate || null,
      };
      const request = await customDesignService.createRequest(payload);
      const failedAttachments: string[] = [];
      setIsUploadingReferences(images.length > 0);

      for (const [index, file] of images.entries()) {
        try {
          const uploaded = await uploadDirectToCloudinary(file, { folder: 'tocco/custom-designs' });
          await customDesignService.createImage({
            request: request.id,
            image: uploaded.secure_url || uploaded.url,
            public_id: uploaded.public_id,
            sort_order: index + 1,
          });
        } catch {
          failedAttachments.push(file.name);
        }
      }
      setIsUploadingReferences(false);

      if (failedAttachments.length > 0) {
        setAttachmentWarning('تم إرسال طلبك، لكن تعذر إرفاق صورة أو أكثر. سيتواصل معك فريقنا بخصوص الطلب.');
      }
      setSubmittedRequestId(request.id);
    } catch (submitError) {
      setError(normalizeApiError(submitError).message);
    } finally {
      setIsUploadingReferences(false);
      setIsSubmitting(false);
    }
  };

  if (submittedRequestId !== null) {
    return (
      <section dir="rtl" className="border-y border-[#DED5C9] bg-[#FBF9F4] px-5 py-8 text-center sm:px-10 sm:py-12" aria-live="polite">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#EEF5EE] text-[#287348]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold text-[#A36046]">تم استلام طلبك</p>
        <h3 className="mt-2 text-xl font-semibold text-[#17324A]">فريقنا سيراجع التفاصيل.</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#6D6A64]">
          سنتواصل معك خلال يومي عمل.
        </p>
        {attachmentWarning && <p className="mx-auto mt-3 max-w-lg text-xs text-[#8A5B16]">{attachmentWarning}</p>}
        <p className="mt-5 text-xs text-[#6D6A64]">ستعود إلى الصفحة الرئيسية خلال ٥ ثوانٍ...</p>
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="mt-4 inline-flex min-h-10 items-center gap-2 border-b border-[#A36046] px-1 text-sm font-semibold text-[#17324A] hover:text-[#A36046]"
        >
          العودة للرئيسية <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>
    );
  }

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    `مرحبًا مودرن هوم، لدي استفسار بخصوص ${requestLabel}.`
  )}`;

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-5 border-y border-[#DED5C9] bg-[#FBF9F4] p-4 sm:space-y-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#17324A]">احكِ لنا عن فكرتك</h3>
          <p className="mt-1 text-sm leading-6 text-[#6D6A64]">شاركنا التفاصيل الأساسية، وسيتواصل معك فريقنا خلال يومي عمل.</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#287348] hover:text-[#17324A]"
        >
          <MessageCircle className="h-4 w-4" /> تحتاج مساعدة؟ واتساب
        </a>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 sm:col-span-2">
          <span className="block text-sm font-medium text-[#17324A]">ما القطعة التي ترغب في تنفيذها؟ <span className="text-rose-700">*</span></span>
          <input
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="مثال: طاولة سفرة بمقاس خاص"
            className="w-full border-b border-[#BFB4A6] bg-transparent px-3.5 py-3 text-sm text-[#18232D] outline-none placeholder:text-[#92897D] focus:border-[#17324A]"
          />
        </label>

        {isBusiness && (
          <label className="space-y-1.5 sm:col-span-2">
            <span className="block text-sm font-medium text-[#17324A]">اسم الشركة أو الاستوديو <span className="text-rose-700">*</span></span>
            <input
              required
              maxLength={160}
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="اسم الشركة"
              className="w-full rounded-lg border border-[#D8CEBF] px-3.5 py-3 text-sm outline-none placeholder:text-[#9B948D] focus:border-[#643D26] focus:ring-2 focus:ring-[#643D26]/10"
            />
          </label>
        )}

        <fieldset className="space-y-1.5 sm:col-span-2">
          <legend className="text-sm font-medium text-[#17324A]">المقاسات التقريبية <span className="font-normal text-[#6D6A64]">(سم؛ أضف مقاسًا واحدًا على الأقل)</span></legend>
          <div className="grid grid-cols-3 gap-2.5">
            {([
              ['العرض', width, setWidth],
              ['الارتفاع', height, setHeight],
              ['العمق', depth, setDepth],
            ] as const).map(([label, value, setter]) => (
              <label key={label} className="space-y-1">
                <span className="text-xs text-[#6D6A64]">{label}</span>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                  placeholder="سم"
                  className="w-full border-b border-[#BFB4A6] bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-[#92897D] focus:border-[#17324A]"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#17324A]">الكمية <span className="text-rose-700">*</span></span>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="w-full rounded-lg border border-[#D8CEBF] px-3.5 py-3 text-sm outline-none focus:border-[#643D26] focus:ring-2 focus:ring-[#643D26]/10"
          />
        </label>
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#17324A]">رقم الهاتف للتواصل <span className="text-rose-700">*</span></span>
          <input
            required
            type="tel"
            maxLength={32}
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder={user?.phone || 'مثال: 010 1234 5678'}
            className="w-full rounded-lg border border-[#D8CEBF] px-3.5 py-3 text-sm outline-none placeholder:text-[#9B948D] focus:border-[#643D26] focus:ring-2 focus:ring-[#643D26]/10"
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#17324A]">موقع المشروع</span>
          <input
            maxLength={180}
            value={projectLocation}
            onChange={(event) => setProjectLocation(event.target.value)}
            placeholder="المدينة أو المنطقة"
            className="w-full rounded-lg border border-[#D8CEBF] px-3.5 py-3 text-sm outline-none placeholder:text-[#9B948D] focus:border-[#643D26] focus:ring-2 focus:ring-[#643D26]/10"
          />
        </label>
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#17324A]">موعد التسليم المطلوب</span>
          <input
            type="date"
            value={targetDeliveryDate}
            onChange={(event) => setTargetDeliveryDate(event.target.value)}
            className="w-full rounded-lg border border-[#D8CEBF] px-3.5 py-3 text-sm text-[#1C1A19] outline-none focus:border-[#643D26] focus:ring-2 focus:ring-[#643D26]/10"
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="block text-sm font-medium text-[#17324A]">صف لنا ما تفكر فيه <span className="text-rose-700">*</span></span>
          <textarea
            required
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="اكتب عن الطراز أو اللون أو الاستخدام أو أي تفاصيل مهمة."
            className="w-full resize-y rounded-lg border border-[#D8CEBF] px-3.5 py-3 text-sm leading-relaxed outline-none placeholder:text-[#9B948D] focus:border-[#643D26] focus:ring-2 focus:ring-[#643D26]/10"
          />
        </label>

        <div className="space-y-2 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-[#17324A]">صور مرجعية <span className="font-normal text-[#6D6A64]">(اختياري، حتى ١٠ صور)</span></p>
            <p className="mt-0.5 text-xs text-[#6D6A64]">أرفق رسومات أو صورًا ملهمة أو صورًا للمكان.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            onChange={handleImageSelection}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES || isSubmitting}
            className="inline-flex min-h-10 items-center gap-2 border-b border-dashed border-[#A36046] px-1 py-2.5 text-xs font-semibold text-[#17324A] hover:text-[#A36046] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" /> إضافة صور ({images.length}/{MAX_IMAGES})
          </button>
          {images.length > 0 && (
            <ul className="space-y-1.5" aria-label="الصور المرجعية المختارة">
              {images.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 border-b border-[#DED5C9] px-1 py-2 text-xs text-[#625E57]">
                  <span className="min-w-0 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                    disabled={isSubmitting}
                    className="shrink-0 rounded p-1 text-[#736B63] hover:bg-white hover:text-[#A33B2B]"
                    aria-label={`إزالة ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EAE4DC] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[#6D6A64]">سيتواصل معك فريقنا خلال يومي عمل.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#17324A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24445E] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? (isUploadingReferences ? 'جارٍ رفع الصور...' : 'جارٍ إرسال الطلب...') : 'إرسال الطلب'}
        </button>
      </div>
    </form>
  );
}