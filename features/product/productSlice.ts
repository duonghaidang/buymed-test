import { ProductCategory } from "@/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProductState {
  searchText: string;
  selectedCategory: ProductCategory;
  quantities: Record<number, number>;
}

const initialState: ProductState = {
  searchText: "",
  selectedCategory: "All",
  quantities: {},
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<ProductCategory>) => {
      state.selectedCategory = action.payload;
    },
    increaseQuantity: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const currentQty = state.quantities[id] ?? 0;
      if (currentQty >= 99) return;
      state.quantities[id] = currentQty + 1;
    },
    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const currentQty = state.quantities[id] ?? 0;
      if (currentQty <= 0) return;
      const next = currentQty - 1;
      if (next === 0) {
        delete state.quantities[id];
      } else {
        state.quantities[id] = next;
      }
    },
    setQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        delete state.quantities[id];
        return;
      }
      const next = Math.min(Math.max(quantity, 0), 99);
      state.quantities[id] = next;
    },
  },
});

export const {
  setSearchText,
  setSelectedCategory,
  increaseQuantity,
  decreaseQuantity,
  setQuantity,
} = productSlice.actions;
export default productSlice.reducer;
