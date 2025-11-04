import { Board, BoardType } from './types';

export class BoardEntity {
  constructor(private board: Board) {}

  get id() { return this.board.id; }
  get name() { return this.board.name; }
  get type() { return this.board.board_type; }
  get createdAt() { return new Date(this.board.created_at); }

  // Business logic
  isChecklist(): boolean {
    return this.board.board_type === BoardType.CHECKLIST;
  }

  getCompletionRate(): number {
    if (!this.board.items || !this.isChecklist()) return 0;
    const completed = this.board.items.filter(item => item.is_checked).length;
    return (completed / this.board.items.length) * 100;
  }

  // Validation
  static isValidName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 100;
  }

  // Formatting
  getFormattedType(): string {
    return this.board.board_type.replace('_', ' ').toUpperCase();
  }

  getRelativeCreatedDate(): string {
    const now = new Date();
    const created = this.createdAt;
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return created.toLocaleDateString();
  }
}
