// frontend/src/components/ProductCard.tsx
import React from 'react';
import './ProductCard.css';
import { useI18n } from '../i18n/I18nContext';

export interface Product {
  id: string;

  // حالت فعلی
  name: string;
  description: string;

  // فیلدهای اختیاری برای چندزبانه کردن محصولات
  nameFa?: string;
  nameEn?: string;
  nameTr?: string;

  descriptionFa?: string;
  descriptionEn?: string;
  descriptionTr?: string;

  image: string;
  priceDisplay: string;
}

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  isProcessing: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuy,
  isProcessing,
}) => {
  const { lang, t } = useI18n();

  const loading = isProcessing === product.id;

  const getProductName = () => {
    if (lang === 'fa') return product.nameFa || product.name;
    if (lang === 'en') return product.nameEn || product.name;
    if (lang === 'tr') return product.nameTr || product.name;

    return product.name;
  };

  const getProductDescription = () => {
    if (lang === 'fa') return product.descriptionFa || product.description;
    if (lang === 'en') return product.descriptionEn || product.description;
    if (lang === 'tr') return product.descriptionTr || product.description;

    return product.description;
  };

  const productName = getProductName();
  const productDescription = getProductDescription();

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={productName}
          className="product-image"
        />

        <div className="product-price-badge">
          {product.priceDisplay}
        </div>
      </div>

      <div className="product-content">
        <h3 className="product-title">{productName}</h3>

        <p className="product-description">
          {productDescription}
        </p>

        <button
          className={`product-button ${loading ? 'loading' : ''}`}
          onClick={() => onBuy(product)}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span style={{ marginInlineStart: '8px' }}>
                {t('productCard.processing')}
              </span>
            </>
          ) : (
            t('productCard.buyNow')
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
