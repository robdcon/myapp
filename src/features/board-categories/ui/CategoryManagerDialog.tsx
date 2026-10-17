'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Box,
  Button,
  Field,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  GET_BOARD_QUERY,
  type BoardCategory,
} from '@/src/entities/board';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { toaster } from '@/components/ui/toaster';
import { LuPlus, LuTrash2 } from 'react-icons/lu';

interface CategoryManagerDialogProps {
  boardId: string;
  categories: BoardCategory[];
  open: boolean;
  onClose: () => void;
}

export function CategoryManagerDialog({
  boardId,
  categories,
  open,
  onClose,
}: Readonly<CategoryManagerDialogProps>) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<BoardCategory | null>(null);
  const [createCategory, { loading: isCreating }] = useMutation(
    CREATE_CATEGORY_MUTATION,
    {
      refetchQueries: [{ query: GET_BOARD_QUERY, variables: { id: boardId } }],
    }
  );
  const [deleteCategory, { loading: isDeleting }] = useMutation(
    DELETE_CATEGORY_MUTATION,
    {
      refetchQueries: [{ query: GET_BOARD_QUERY, variables: { id: boardId } }],
    }
  );

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter a category name.');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Category names must be 50 characters or fewer.');
      return;
    }

    setError('');
    try {
      await createCategory({ variables: { boardId, name: trimmedName } });
      setName('');
      toaster.create({
        title: 'Category added',
        type: 'success',
        duration: 3000,
      });
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to add this category.'
      );
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setError('');
    try {
      await deleteCategory({
        variables: { boardId, categoryId: categoryToDelete.id },
      });
      toaster.create({
        title: 'Category deleted',
        type: 'success',
        duration: 3000,
      });
      setCategoryToDelete(null);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to delete this category.'
      );
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <DialogRoot
        open={open}
        onOpenChange={(details) => !details.open && onClose()}
        size="md"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Board categories</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack align="stretch" gap={5}>
              <Text color="gray.600" fontSize="sm">
                Categories organize this board. Items using a category must be moved or
                deleted before that category can be removed.
              </Text>

              {error && (
                <Alert.Root status="error">
                  <Alert.Indicator />
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Root>
              )}

              <form onSubmit={handleCreate}>
                <Box>
                  <Field.Root>
                    <Field.Label>New category</Field.Label>
                    <HStack>
                      <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Garden supplies"
                        maxLength={50}
                        aria-describedby="category-name-limit"
                      />
                      <Button
                        type="submit"
                        colorPalette="appPrimary"
                        loading={isCreating}
                        disabled={!name.trim()}
                      >
                        <LuPlus />
                        Add
                      </Button>
                    </HStack>
                    <Field.HelperText id="category-name-limit">
                      Up to 50 characters. Names are unique on this board.
                    </Field.HelperText>
                  </Field.Root>
                </Box>
              </form>

              <VStack align="stretch" gap={0} divideY="1px" divideColor="gray.100">
                {categories.map((category) => (
                  <HStack key={category.id} justify="space-between" py={3}>
                    <Box>
                      <Text fontWeight="medium">{category.name}</Text>
                      {category.active_item_count > 0 && (
                        <Text color="gray.600" fontSize="sm">
                          Used by {category.active_item_count} active{' '}
                          {category.active_item_count === 1 ? 'item' : 'items'}
                        </Text>
                      )}
                    </Box>
                    <IconButton
                      aria-label={`Delete ${category.name}`}
                      variant="ghost"
                      colorPalette="red"
                      disabled={category.active_item_count > 0}
                      onClick={() => setCategoryToDelete(category)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={categoryToDelete !== null}
        onOpenChange={(details) => !details.open && setCategoryToDelete(null)}
        size="sm"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogCloseTrigger disabled={isDeleting} />
          </DialogHeader>
          <DialogBody>
            Delete “{categoryToDelete?.name}”? This category will no longer be available
            for this board.
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              colorPalette="red"
              onClick={() => void handleDelete()}
              loading={isDeleting}
            >
              Delete category
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
