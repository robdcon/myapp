'use client';

import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { CreateBoardModal } from './CreateBoardModal';

interface CreateBoardButtonProps {
  onBoardCreated?: (boardId: string) => void;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function CreateBoardButton({
  onBoardCreated,
  variant = 'solid',
  size = 'md',
}: CreateBoardButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        colorPalette="appPrimary"
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
      >
        + Create Board
      </Button>

      <CreateBoardModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBoardCreated={onBoardCreated}
      />
    </>
  );
}
