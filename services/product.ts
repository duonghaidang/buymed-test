import { Product, ProductCategory } from "@/types/product";
import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";

export interface GetProductsArgs {
  search?: string;
  category?: ProductCategory;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    price: 15000,
    category: "Pain Relief",
    isPrescription: false,
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    price: 45000,
    category: "Antibiotic",
    isPrescription: true,
  },
  {
    id: 3,
    name: "Vitamin C 1000mg",
    price: 30000,
    category: "Supplement",
    isPrescription: false,
  },
  {
    id: 4,
    name: "Cetirizine 10mg",
    price: 20000,
    category: "Allergy",
    isPrescription: false,
  },
];

const mockBaseQuery: BaseQueryFn<GetProductsArgs | void, Product[], unknown> =
  async (arg) => {
    const search =
      arg && "search" in arg && arg.search
        ? arg.search.trim().toLowerCase()
        : "";

    const category =
      arg && "category" in arg && arg.category ? arg.category : "All";

    let result = MOCK_PRODUCTS;

    if (category && category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }

    return { data: result };
  };

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: mockBaseQuery,
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], GetProductsArgs | void>({
      query: (args) => args ?? {},
    }),
  }),
});

export const { useGetProductsQuery } = productApi;
