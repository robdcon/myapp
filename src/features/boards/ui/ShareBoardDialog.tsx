'use client';

import { useState } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogCloseTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_BOARD_SHARES_QUERY, SHARE_BOARD_MUTATION, UPDATE_BOARD_SHARE_MUTATION, REMOVE_BOARD_SHARE_MUTATION } from '@/src/entities/board-share/api';
import { PermissionLevel, BoardShare } from '@/types/board-share';

interface ShareBoardDialogProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
}

const permissionItems = createListCollection({
  items: [
    { label: 'Can view', value: PermissionLevel.VIEW },
    { label: 'Can edit', value: PermissionLevel.EDIT },
    { label: 'Admin', value: PermissionLevel.ADMIN },
  ],
});

export function ShareBoardDialog({ open, onClose, boardId, boardName }: ShareBoardDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<string[]>([PermissionLevel.EDIT]);
  const [error, setError] = useState('');
  const [shareToRemove, setShareToRemove] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_BOARD_SHARES_QUERY, {
    variables: { boardId },
    skip: !open,
  });

  const [shareBoard, { loading: sharing }] = useMutation(SHARE_BOARD_MUTATION, {
    onCompleted: () => {
      setEmail('');
      setError('');
      refetch();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [updateShare, { loading: updating }] = useMutation(UPDATE_BOARD_SHARE_MUTATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const [removeShare, { loading: removing }] = useMutation(REMOVE_BOARD_SHARE_MUTATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      await shareBoard({
        variables: {
          boardId,
          email: email.trim(),
          permission: permission[0] as PermissionLevel,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while sharing the board.');
      }
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: PermissionLevel) => {
    await updateShare({
      variables: {
        shareId,
        permission: newPermission,
      },
    });
  };

  const handleRemoveShare = (shareId: string) => {
    setShareToRemove(shareId);
  };

  const handleConfirmRemoveShare = async () => {
    if (shareToRemove) {
      await removeShare({
        variables: { shareId: shareToRemove },
      });
      setShareToRemove(null);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{boardName}"</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={6} align="stretch">
            {/* Share Form */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Invite someone to collaborate
              </Text>
              <VStack gap={3} align="stretch">
                <Input
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleShare();
                    }
                  }}
                />

                <HStack>
                  <Box flex={1}>
                    <SelectRoot
                      collection={permissionItems}
                      value={permission}
                      onValueChange={(e) => setPermission(e.value)}
                      size="sm"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select permission" />
                      </SelectTrigger>
                      <SelectContent>
                        {permissionItems.items.map((item) => (
                          <SelectItem key={item.value} item={item}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Box>

                  <Button
                    colorPalette="appPrimary"
                    onClick={handleShare}
                    disabled={sharing || !email.trim()}
                  >
                    {sharing ? <Spinner size="sm" /> : 'Share'}
                  </Button>
                </HStack>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Current Shares */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                People with access
              </Text>

              {loading ? (
                <HStack justify="center" py={4}>
                  <Spinner size="sm" />
                </HStack>
              ) : (
                <VStack gap={2} align="stretch">
                  {data?.boardShares?.length === 0 ? (
                    <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                      No one else has access yet
                    </Text>
                  ) : (
                    data?.boardShares?.map((share: BoardShare) => (
                      <HStack
                        key={share.id}
                        p={3}
                        bg="gray.50"
                        _dark={{ bg: 'gray.800' }}
                        borderRadius="md"
                        justify="space-between"
                      >
                        <Box flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {share.shared_with_user_name || share.shared_with_user_email}
                          </Text>
                          {share.shared_with_user_name && (
                            <Text fontSize="xs" color="gray.500">
                              {share.shared_with_user_email}
                            </Text>
                          )}
                        </Box>

                        <HStack gap={2}>
                          <SelectRoot
                            collection={permissionItems}
                            value={[share.permission_level]}
                            onValueChange={(e) =>
                              handleUpdatePermission(share.id, e.value[0] as PermissionLevel)
                            }
                            disabled={updating}
                            size="sm"
                            width="140px"
                          >
                            <SelectTrigger>
                              <SelectValueText />
                            </SelectTrigger>
                            <SelectContent>
                              {permissionItems.items.map((item) => (
                                <SelectItem key={item.value} item={item}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </SelectRoot>

                          <Button
                            aria-label={`Remove access for ${share.shared_with_user_name || share.shared_with_user_email}`}
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleRemoveShare(share.id)}
                            disabled={removing}
                            px={2}
                          >
                            <span aria-hidden="true">✕</span>
                          </Button>
                        </HStack>
                      </HStack>
                    ))
                  )}
                </VStack>
              )}
            </Box>

            {/* Permission Descriptions */}
            <Box bg="gray.50" _dark={{ bg: 'gray.800' }} p={3} borderRadius="md">
              <Text fontSize="xs" fontWeight="medium" mb={2}>
                Permission levels:
              </Text>
              <VStack gap={1} align="stretch" fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                <HStack>
                  <Badge colorPalette="gray" size="sm">VIEW</Badge>
                  <Text>Can only view the board and items (read-only)</Text>
                </HStack>
                <HStack>
                  <Badge colorPalette="blue" size="sm">EDIT</Badge>
                  <Text>Can view, create, update, and delete items</Text>
                </HStack>
                <HStack>
                  <Badge colorPalette="purple" size="sm">ADMIN</Badge>
                  <Text>Can do everything including sharing the board</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={shareToRemove !== null}
        onClose={() => setShareToRemove(null)}
        onConfirm={handleConfirmRemoveShare}
        title="Remove Access"
        message="Are you sure you want to remove this person's access to the board?"
        confirmText="Remove"
        cancelText="Cancel"
        confirmColorPalette="red"
      />
    </DialogRoot>
  );
}
