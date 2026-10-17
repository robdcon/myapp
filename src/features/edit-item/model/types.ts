export interface EditItemFeatureProps {
  itemId: string | null;
  boardId: string;
  categories: string[];
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
  initialValues?: {
    name: string;
    details: string;
    category: string;
  };
}
