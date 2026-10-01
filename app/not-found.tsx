import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans">
      <h2 className="text-2xl font-bold text-[#17324A]">الصفحة غير موجودة</h2>
      <p className="mt-2 text-sm text-[#6D6A64]">عذرًا، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.</p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center justify-center rounded bg-[#17324A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#122A3D]"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
