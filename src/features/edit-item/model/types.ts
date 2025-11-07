export interface EditItemFeatureProps {
  itemId: string | null;
  boardId: string;
  onSuccess?: () => void;
  existingCategories?: string[];
  isOpen: boolean;
  onClose: () => void;
  initialValues?: {
    name: string;
    details: string;
    category: string;
  };
}