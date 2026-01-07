'use client';

import { useState } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogCloseTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_BOARD_SHARES_QUERY, SHARE_BOARD_MUTATION, UPDATE_BOARD_SHARE_MUTATION, REMOVE_BOARD_SHARE_MUTATION } from '@/src/entities/board-share/api';
import { PermissionLevel, BoardShare } from '@/types/board-share';

interface ShareBoardDialogProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
}

export function ShareBoardDialog({ open, onClose, boardId, boardName }: ShareBoardDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>(PermissionLevel.EDIT);
  const [error, setError] = useState('');

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
          permission,
        },
      });
    } catch (err) {
      // Error handled in onError
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

  const handleRemoveShare = async (shareId: string) => {
    if (window.confirm('Are you sure you want to remove this share?')) {
      await removeShare({
        variables: { shareId },
      });
    }
  };

  const getPermissionColor = (perm: PermissionLevel) => {
    switch (perm) {
      case PermissionLevel.VIEW:
        return 'gray';
      case PermissionLevel.EDIT:
        return 'blue';
      case PermissionLevel.ADMIN:
        return 'purple';
      default:
        return 'gray';
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
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value as PermissionLevel)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        backgroundColor: 'white',
                      }}
                    >
                      <option value={PermissionLevel.VIEW}>Can view</option>
                      <option value={PermissionLevel.EDIT}>Can edit</option>
                      <option value={PermissionLevel.ADMIN}>Admin</option>
                    </select>
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
                          <select
                            value={share.permission_level}
                            onChange={(e) =>
                              handleUpdatePermission(share.id, e.target.value as PermissionLevel)
                            }
                            disabled={updating}
                            style={{
                              width: '140px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              fontSize: '13px',
                              backgroundColor: 'white',
                            }}
                          >
                            <option value={PermissionLevel.VIEW}>Can view</option>
                            <option value={PermissionLevel.EDIT}>Can edit</option>
                            <option value={PermissionLevel.ADMIN}>Admin</option>
                          </select>

                          <IconButton
                            aria-label="Remove access"
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleRemoveShare(share.id)}
                            disabled={removing}
                          >
                            ✕
                          </IconButton>
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
    </DialogRoot>
  );
}
