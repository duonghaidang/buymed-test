import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  decreaseQuantity,
  increaseQuantity,
  setQuantity,
  setSearchText,
  setSelectedCategory,
} from "@/features/product/productSlice";
import { useDebounced } from "@/hooks/use-debounced";
import { useGetProductsQuery } from "@/services/product";
import { RootState } from "@/stores/store";
import { Product, ProductCategory } from "@/types/product";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

const formatCurrency = (value: number) => `${value.toLocaleString("en-US")} đ`;

const showErrorToast = (message: string) => {
  Toast.error(message);
};

type ProductItemProps = {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onSetQuantity: (value: number) => void;
};

const categories: ProductCategory[] = [
  "All",
  "Pain Relief",
  "Antibiotic",
  "Supplement",
  "Allergy",
];

const ProductItem = memo(
  ({
    product,
    quantity,
    onIncrease,
    onDecrease,
    onSetQuantity,
  }: ProductItemProps) => {
    const showControls = quantity > 0;
    const [localQty, setLocalQty] = useState(quantity.toString());

    useEffect(() => {
      setLocalQty(quantity > 0 ? quantity.toString() : "");
    }, [quantity]);

    const handleCommitQuantity = () => {
      if (!localQty.trim()) {
        onSetQuantity(0);
        return;
      }
      const parsed = parseInt(localQty, 10);
      if (Number.isNaN(parsed)) {
        onSetQuantity(0);
        return;
      }
      onSetQuantity(parsed);
    };

    return (
      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productMeta}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>
        <View style={styles.productActions}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {showControls ? (
            <View style={styles.qtyGroup}>
              <TouchableOpacity
                onPress={onDecrease}
                disabled={quantity <= 0}
                style={[
                  styles.qtyButton,
                  quantity <= 0 && styles.disabledButton,
                ]}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                keyboardType="number-pad"
                value={localQty}
                onChangeText={setLocalQty}
                onBlur={handleCommitQuantity}
                onSubmitEditing={handleCommitQuantity}
                maxLength={2}
              />
              <TouchableOpacity
                onPress={onIncrease}
                disabled={quantity >= 99}
                style={[
                  styles.qtyButton,
                  quantity >= 99 && styles.disabledButton,
                ]}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addCartBtn}
              onPress={() => onSetQuantity(1)}
            >
              <MaterialIcons name="add-shopping-cart" size={22} color="#fff" />
              <Text style={styles.addCartText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        {product.isPrescription ? (
          <View style={styles.rxBadge}>
            <Text style={styles.rxText}>Rx</Text>
          </View>
        ) : null}
      </View>
    );
  }
);

ProductItem.displayName = "ProductItem";

export default function QuickOrderScreen() {
  const dispatch = useDispatch();
  const { searchText, selectedCategory, quantities } = useSelector(
    (state: RootState) => state.product
  );

  const debouncedSearch = useDebounced<string>(searchText);

  const {
    data: products = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetProductsQuery({
    search: debouncedSearch,
    category: selectedCategory,
  });

  const filteredProducts = products;

  const summary = useMemo(() => {
    let totalSkus = 0;
    let totalQty = 0;
    let totalAmount = 0;

    products.forEach((product) => {
      const qty = quantities[product.id] ?? 0;
      if (qty > 0) {
        totalSkus += 1;
        totalQty += qty;
        totalAmount += qty * product.price;
      }
    });

    return { totalSkus, totalQty, totalAmount };
  }, [products, quantities]);

  const handleSetQuantity = useCallback(
    (id: number, qty: number) => {
      const clamped = Math.min(Math.max(Math.floor(qty) || 0, 0), 99);
      if (clamped >= 100) {
        showErrorToast("Maximum quantity is 99");
      } else if (qty > 99) {
        showErrorToast("Maximum quantity is 99");
      }
      dispatch(setQuantity({ id, quantity: clamped }));
    },
    [dispatch]
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => {
      const qty = quantities[item.id] ?? 0;

      return (
        <ProductItem
          key={item.id}
          product={item}
          quantity={qty}
          onIncrease={() => dispatch(increaseQuantity(item.id))}
          onDecrease={() => dispatch(decreaseQuantity(item.id))}
          onSetQuantity={(value) => handleSetQuantity(item.id, value)}
        />
      );
    },
    [dispatch, handleSetQuantity, quantities]
  );

  const renderContent = () => {
    if (isLoading && products.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading products...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.muted}>Failed to load data.</Text>
          <TouchableOpacity style={styles.retry} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.muted}>No products found.</Text>
          <Text style={styles.mutedSmall}>
            Try changing your search or filters.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Order</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={(text) => {
            dispatch(setSearchText(text));
          }}
          placeholder="Search products..."
          style={styles.searchInput}
          placeholderTextColor="#888"
        />
        {(isFetching || isLoading) && (
          <View style={styles.debounceLoading}>
            <ActivityIndicator size="small" />
            <Text style={styles.debounceLoadingText}>Searching...</Text>
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        {categories.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => dispatch(setSelectedCategory(cat))}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.listWrapper}>{renderContent()}</View>

      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryLabel}>SKUs: {summary.totalSkus}</Text>
          <Text style={styles.summaryLabel}>Qty: {summary.totalQty}</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>
            {formatCurrency(summary.totalAmount)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  debounceLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  debounceLoadingText: {
    fontSize: 12,
    color: "gray",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: "black",
    borderColor: "black",
  },
  tabText: {
    fontSize: 14,
    color: "black",
  },
  tabTextActive: {
    color: "white",
    fontWeight: "600",
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  listContent: {
    paddingVertical: 8,
    gap: 12,
  },
  productRow: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryText: {
    fontSize: 13,
    color: "gray",
  },
  rxBadge: {
    position: "absolute",
    width: 82,
    top: 0,
    left: -30,
    backgroundColor: "red",
    paddingVertical: 4,
    transform: [{ rotate: "-45deg" }],
  },
  rxText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  productActions: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  qtyGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gray",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.4,
  },
  qtyInput: {
    minWidth: 42,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingVertical: 4,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  qtyValue: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  muted: {
    color: "gray",
  },
  mutedSmall: {
    color: "gray",
    fontSize: 13,
  },
  retry: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
  },
  retryText: {
    color: "black",
    fontWeight: "600",
  },
  addCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "black",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCartText: {
    color: "white",
    fontWeight: "700",
  },
  summaryBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "black",
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  summaryTotalLabel: {
    fontSize: 13,
    color: "black",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
