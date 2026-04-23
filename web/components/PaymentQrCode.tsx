'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function PaymentQrCode({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: 256,
      margin: 1,
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (!dataUrl) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">二维码生成中...</div>;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="微信支付二维码" className="h-full w-full object-contain" />;
}
