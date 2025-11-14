export interface CreateItemFeatureProps {
  boardId: string;
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}