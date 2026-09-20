// frontend/src/pages/Shop.tsx
import React, { useState } from 'react';
import ProductCard, { Product } from '../components/ProductCard';
import { useI18n } from '../i18n/I18nContext';
import './Shop.css';

interface StatusMsg {
  type: 'success' | 'error' | 'info';
  text: string;
}

const Shop: React.FC = () => {
  const { t } = useI18n();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<StatusMsg | null>(null);

  // تعریف محصولات با کلیدهای Namespaced جهت ترجمه
  // نکته: ProductCard باید از این کلیدها برای نمایش نام و توضیحات استفاده کند
  const products: Product[] = [
    {
      id: '1',
      nameKey: 'shop.products.art.name',
      descriptionKey: 'shop.products.art.description',
      image: 'https://via.placeholder.com/150',
      priceDisplay: '10 π',
    },
    {
      id: '2',
      nameKey: 'shop.products.membership.name',
      descriptionKey: 'shop.products.membership.description',
      image: 'https://via.placeholder.com/150',
      priceDisplay: '50 π',
    },
    {
      id: '3',
      nameKey: 'shop.products.course.name',
      descriptionKey: 'shop.products.course.description',
      image: 'https://via.placeholder.com/150',
      priceDisplay: '25 π',
    },
  ];

  const handlePurchase = async (product: Product) => {
    setIsProcessing(product.id);
    setStatusMsg(null);

    try {
      // شبیه‌سازی فرایند پرداخت
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStatusMsg({
        type: 'success',
        text: `${t('shop.messages.purchaseSuccess')}: ${t(product.nameKey)}`,
      });
    } catch (error) {
      setStatusMsg({
        type: 'error',
        text: t('shop.messages.purchaseError'),
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-container">
        <header className="shop-header">
          <h2 className="shop-title">{t('shop.title')}</h2>
          <p className="shop-subtitle">{t('shop.subtitle')}</p>
        </header>

        {statusMsg && (
          <div className={`status-banner ${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handlePurchase}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
