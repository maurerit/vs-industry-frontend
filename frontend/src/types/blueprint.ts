export interface Material {
  typeid: number;
  name: string;
  quantity: number;
  maketype: string | null;
  price: number | null;
}

export interface BlueprintData {
  blueprintDetails: {
    maxProductionLimit: number;
    productTypeID: number;
    productTypeName: string;
    productQuantity: number | null;
  };
  activityMaterials: {
    manufacturing: Material[];
    invention: Material[];
    copying: Material[];
  };
} 