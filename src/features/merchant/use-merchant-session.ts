import { useEffect, useMemo } from 'react';

import { getMerchantProducts } from '@/features/merchant/metrics';
import { useOrdersStore } from '@/store/orders-store';
import { createStoreId, useProfileStore } from '@/store/profile-store';
import { useShopStore } from '@/store/shop-store';

export function useMerchantSession() {
  const accountType = useProfileStore((state) => state.accountType);
  const storeId = useProfileStore((state) => state.storeId);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const products = useShopStore((state) => state.products);
  const claimLegacyProducts = useShopStore((state) => state.claimLegacyProducts);
  const claimLegacyOrderLines = useOrdersStore((state) => state.claimLegacyOrderLines);
  const ownedProductIds = useMemo(
    () => getMerchantProducts(products, storeId).map((product) => `seller-${product.id}`),
    [products, storeId],
  );

  useEffect(() => {
    if (accountType === 'merchant' && !storeId) updateProfile({ storeId: createStoreId() });
  }, [accountType, storeId, updateProfile]);

  useEffect(() => {
    if (accountType !== 'merchant' || !storeId) return;
    claimLegacyProducts(storeId);
    claimLegacyOrderLines(storeId, ownedProductIds);
  }, [accountType, claimLegacyOrderLines, claimLegacyProducts, ownedProductIds, storeId]);
}
