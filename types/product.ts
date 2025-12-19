export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  isPrescription: boolean;
}

export type ProductCategory =
  | "All"
  | "Pain Relief"
  | "Antibiotic"
  | "Supplement"
  | "Allergy";

// [
//     { "id": 1, "name": "Paracetamol 500mg", "price": 15000, "category": "Pain Relief", "isPrescription": false },
//     { "id": 2, "name": "Amoxicillin 500mg", "price": 45000, "category": "Antibiotic", "isPrescription": true },
//     { "id": 3, "name": "Vitamin C 1000mg", "price": 30000, "category": "Supplement", "isPrescription": false },
//     { "id": 4, "name": "Cetirizine 10mg", "price": 20000, "category": "Allergy", "isPrescription": false }
//   ]
