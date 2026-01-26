'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Spinner,
  Button,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { toaster } from '@/components/ui/toaster';
import {
  AVAILABLE_CALENDARS_QUERY,
  SELECT_CALENDAR_MUTATION,
} from '@/src/entities/board';

interface GoogleCalendar {
  id: string;
  name: string;
  description?: string | null;
  primary: boolean;
}

interface AvailableCalendarsData {
  availableCalendars: GoogleCalendar[];
}

interface CalendarSelectorModalProps {
  boardId: string;
  open: boolean;
  onClose: () => void;
  onCalendarSelected: () => void;
}

export function CalendarSelectorModal({
  boardId,
  open,
  onClose,
  onCalendarSelected,
}: CalendarSelectorModalProps) {
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');

  // Query available calendars
  const { data, loading, error } = useQuery<AvailableCalendarsData>(
    AVAILABLE_CALENDARS_QUERY,
    {
      variables: { boardId },
      skip: !open, // Only fetch when modal is open
    }
  );

  // Mutation to select calendar
  const [selectCalendar, { loading: selecting }] = useMutation(SELECT_CALENDAR_MUTATION, {
    onCompleted: () => {
      toaster.create({
        title: 'Calendar Selected',
        description: 'Your Google Calendar is now connected to this board',
        type: 'success',
        duration: 5000,
      });
      onCalendarSelected();
      onClose();
    },
    onError: (err) => {
      toaster.create({
        title: 'Selection Failed',
        description: err.message || 'Failed to select calendar',
        type: 'error',
        duration: 7000,
      });
    },
  });

  const handleSelect = () => {
    if (!selectedCalendarId) {
      toaster.create({
        title: 'No Calendar Selected',
        description: 'Please select a calendar to continue',
        type: 'warning',
        duration: 5000,
      });
      return;
    }

    const calendar = data?.availableCalendars.find((c) => c.id === selectedCalendarId);
    if (!calendar) return;

    selectCalendar({
      variables: {
        boardId,
        calendarId: calendar.id,
        calendarName: calendar.name,
      },
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={(e) => !selecting && onClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Google Calendar</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          {loading && (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" colorPalette="blue" />
              <Text mt={4} color="gray.600">
                Loading your calendars...
              </Text>
            </Box>
          )}

          {error && (
            <Box textAlign="center" py={8}>
              <Text color="red.500">Failed to load calendars</Text>
              <Text color="gray.600" fontSize="sm" mt={2}>
                {error.message}
              </Text>
            </Box>
          )}

          {data && data.availableCalendars.length === 0 && (
            <Box textAlign="center" py={8}>
              <Text color="gray.600">No calendars found in your Google account</Text>
            </Box>
          )}

          {data && data.availableCalendars.length > 0 && (
            <VStack gap={3} align="stretch">
              <Text color="gray.600" fontSize="sm">
                Choose which calendar you'd like to sync with this Events board:
              </Text>

              <VStack gap={2} align="stretch">
                {data.availableCalendars.map((calendar) => (
                  <Box
                    key={calendar.id}
                    p={3}
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={
                      selectedCalendarId === calendar.id ? 'blue.500' : 'gray.200'
                    }
                    bg={selectedCalendarId === calendar.id ? 'blue.50' : 'white'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'blue.300', bg: 'blue.25' }}
                    onClick={() => setSelectedCalendarId(calendar.id)}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          {selectedCalendarId === calendar.id && (
                            <Text fontSize="lg">✓</Text>
                          )}
                          <Heading size="sm">{calendar.name}</Heading>
                          {calendar.primary && (
                            <Badge colorPalette="blue" size="sm">
                              PRIMARY
                            </Badge>
                          )}
                        </HStack>
                        {calendar.description && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            ml={selectedCalendarId === calendar.id ? 6 : 0}
                          >
                            {calendar.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={selecting}>
            Cancel
          </Button>
          <Button
            colorPalette="blue"
            onClick={handleSelect}
            disabled={!selectedCalendarId || selecting}
            loading={selecting}
          >
            {selecting ? 'Selecting...' : 'Select Calendar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
