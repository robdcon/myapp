export interface CreateItemFeatureProps {
  boardId: string;
  onSuccess?: () => void;
  existingCategories?: string[];
  isOpen: boolean;
  onClose: () => void;
}