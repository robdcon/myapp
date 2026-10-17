export interface CreateItemFeatureProps {
  boardId: string;
  categories: string[];
  onSuccess?: (category?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}
