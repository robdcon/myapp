export interface CreateItemFeatureProps {
  boardId: string;
  onSuccess?: (category?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}
