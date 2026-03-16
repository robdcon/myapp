'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Box, VStack, Text, Heading, Button, Input, Textarea } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { CREATE_BOARD_MUTATION, MY_BOARDS_QUERY, BoardType } from '@/src/entities/board';
import { SHARE_BOARD_MUTATION } from '@/src/entities/board-share';
import { createListCollection } from '@chakra-ui/react';

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  onBoardCreated?: (boardId: string) => void;
}

const boardTypes = createListCollection({
  items: [
    { label: '✓ Checklist', value: BoardType.CHECKLIST },
    { label: '📋 Notice Board', value: BoardType.NOTICE_BOARD },
    { label: '📅 Events', value: BoardType.EVENTS },
  ],
});

export function CreateBoardModal({
  open,
  onClose,
  onBoardCreated,
}: CreateBoardModalProps) {
  const [boardName, setBoardName] = useState('');
  const [boardType, setBoardType] = useState<string[]>([BoardType.NOTICE_BOARD]);
  const [description, setDescription] = useState('');
  const [shareWithEmail, setShareWithEmail] = useState('');

  const [createBoard, { loading: creating }] = useMutation(CREATE_BOARD_MUTATION, {
    refetchQueries: [{ query: MY_BOARDS_QUERY }],
    onCompleted: async (data) => {
      const newBoardId = (data as { createBoard: { id: string } }).createBoard.id;

      // If user entered an email, share the board
      if (shareWithEmail.trim()) {
        try {
          await shareBoard({
            variables: {
              boardId: newBoardId,
              email: shareWithEmail.trim(),
              permission: 'EDIT', // Default to EDIT permission
            },
          });
          toaster.create({
            title: 'Board Created & Shared',
            description: `"${boardName}" has been created and shared with ${shareWithEmail}`,
            type: 'success',
            duration: 5000,
          });
        } catch (error) {
          toaster.create({
            title: 'Board Created',
            description: `"${boardName}" was created, but failed to share: ${error instanceof Error ? error.message : 'Unknown error'}`,
            type: 'warning',
            duration: 7000,
          });
        }
      } else {
        toaster.create({
          title: 'Board Created',
          description: `"${boardName}" has been created successfully`,
          type: 'success',
          duration: 5000,
        });
      }

      handleClose();
      if (onBoardCreated) {
        onBoardCreated(newBoardId);
      }
    },
    onError: (error) => {
      toaster.create({
        title: 'Failed to Create Board',
        description: error.message,
        type: 'error',
        duration: 7000,
      });
    },
  });

  const [shareBoard, { loading: sharing }] = useMutation(SHARE_BOARD_MUTATION);

  const handleClose = () => {
    setBoardName('');
    setBoardType([BoardType.NOTICE_BOARD]);
    setDescription('');
    setShareWithEmail('');
    onClose();
  };

  const handleSubmit = () => {
    if (!boardName.trim()) {
      toaster.create({
        title: 'Board Name Required',
        description: 'Please enter a name for your board',
        type: 'warning',
        duration: 5000,
      });
      return;
    }

    createBoard({
      variables: {
        name: boardName.trim(),
        board_type: boardType[0],
        description: description.trim() || null,
      },
    });
  };

  const isLoading = creating || sharing;

  return (
    <DialogRoot open={open} onOpenChange={(e) => !isLoading && handleClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogCloseTrigger disabled={isLoading} />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Board Name */}
            <Field label="Board Name" required>
              <Input
                placeholder="Enter board name"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </Field>

            {/* Board Type */}
            <Field label="Board Type" required>
              <SelectRoot
                collection={boardTypes}
                value={boardType}
                onValueChange={(e) => setBoardType(e.value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select board type" />
                </SelectTrigger>
                <SelectContent>
                  {boardTypes.items.map((type) => (
                    <SelectItem key={type.value} item={type}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>

            {/* Description */}
            <Field label="Description (Optional)">
              <Textarea
                placeholder="Enter a brief description for your board"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </Field>

            {/* Share with Email */}
            <Box>
              <Field label="Share with User (Optional)">
                <Input
                  type="email"
                  placeholder="Enter email address to share with"
                  value={shareWithEmail}
                  onChange={(e) => setShareWithEmail(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Text fontSize="sm" color="gray.600" mt={1}>
                The user will receive EDIT permission on the new board
              </Text>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorPalette="appPrimary"
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Board'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
