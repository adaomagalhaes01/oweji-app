import { useEffect, useMemo } from 'react';

import { getMerchantProducts } from '@/features/merchant/metrics';
import { useOrdersStore } from '@/store/orders-store';
import { createStoreId, useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

export function useMerchantSession() {
  const accountType = useProfileStore((state) => state.accountType);
  const approvalStatus = useProfileStore((state) => state.merchantApprovalStatus);
  const storeId = useProfileStore((state) => state.storeId);
  const storeName = useProfileStore((state) => state.storeName);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const products = useShopStore((state) => state.products);
  const claimLegacyProducts = useShopStore((state) => state.claimLegacyProducts);
  const updateProduct = useShopStore((state) => state.updateProduct);
  const claimLegacyOrderLines = useOrdersStore((state) => state.claimLegacyOrderLines);
  const ownedProductIds = useMemo(
    () => getMerchantProducts(products, storeId).map((product) => `seller-${product.id}`),
    [products, storeId],
  );

  useEffect(() => {
    if (accountType === 'merchant' && approvalStatus === 'approved' && !storeId) updateProfile({ storeId: createStoreId() });
  }, [accountType, approvalStatus, storeId, updateProfile]);

  useEffect(() => {
    if (accountType !== 'merchant' || approvalStatus !== 'approved' || !storeId) return;
    claimLegacyProducts(storeId);
    products.forEach((product) => {
      if (product.merchantId === storeId && !product.merchantStoreName && storeName) {
        updateProduct(product.id, storeId, { merchantStoreName: storeName });
      }
    });
    claimLegacyOrderLines(storeId, ownedProductIds, storeName);
  }, [accountType, approvalStatus, claimLegacyOrderLines, claimLegacyProducts, ownedProductIds, products, storeId, storeName, updateProduct]);
}
