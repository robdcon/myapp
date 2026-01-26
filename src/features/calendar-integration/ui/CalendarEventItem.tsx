'use client';

import React from 'react';
import { Box, Flex, VStack, HStack, Text, Badge, Button } from '@chakra-ui/react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Item } from '@/src/entities/item';

export interface CalendarEventItemProps {
  item: Item;
  onEdit: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
}

/**
 * Special renderer for calendar event items
 * Shows event details with enhanced styling and calendar link
 */
export const CalendarEventItem = React.memo(function CalendarEventItem({
  item,
  onEdit,
  onDelete,
}: Readonly<CalendarEventItemProps>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showDescription, setShowDescription] = React.useState(false);

  // Debug logging to see what data we're getting
  React.useEffect(() => {
    if (item.google_event_id) {
      console.log('CalendarEventItem data:', {
        id: item.id,
        name: item.name,
        event_start_time: item.event_start_time,
        event_end_time: item.event_end_time,
        event_start_type: typeof item.event_start_time,
        event_end_type: typeof item.event_end_time,
      });
    }
  }, [item]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(item.id);
    },
    [onEdit, item.id]
  );

  const handleDeleteClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = React.useCallback(() => {
    if (onDelete) {
      onDelete(item.id);
    }
  }, [onDelete, item.id]);

  const formatEventDate = (
    start: string | null | undefined,
    end: string | null | undefined
  ) => {
    if (!start) return null;

    // Try to parse the date - handle ISO strings, Unix timestamps, or timestamp strings
    let startDate: Date;
    try {
      // Check if it's a numeric timestamp (as string)
      if (/^\d+$/.test(start)) {
        // It's a Unix timestamp in milliseconds as a string
        startDate = new Date(parseInt(start, 10));
      } else {
        // Try parsing as ISO string or other date format
        startDate = new Date(start);
      }

      // Check if date is valid
      if (isNaN(startDate.getTime())) {
        console.error('Invalid start date:', start);
        return '📅 Invalid date';
      }
    } catch (error) {
      console.error('Error parsing start date:', start, error);
      return '📅 Invalid date';
    }

    let endDate: Date | null = null;
    if (end) {
      try {
        // Check if it's a numeric timestamp (as string)
        if (/^\d+$/.test(end)) {
          endDate = new Date(parseInt(end, 10));
        } else {
          endDate = new Date(end);
        }

        if (isNaN(endDate.getTime())) {
          console.error('Invalid end date:', end);
          endDate = null;
        }
      } catch (error) {
        console.error('Error parsing end date:', end, error);
        endDate = null;
      }
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const dateStr = startDate.toLocaleDateString('en-US', dateOptions);

    // Check if it's an all-day event (no time component or midnight times)
    const startHours = startDate.getUTCHours();
    const startMinutes = startDate.getUTCMinutes();
    const isAllDay =
      startHours === 0 &&
      startMinutes === 0 &&
      (!endDate || (endDate.getUTCHours() === 0 && endDate.getUTCMinutes() === 0));

    if (isAllDay) {
      return `📅 ${dateStr}`;
    }

    const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
    if (endDate) {
      const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
      return `📅 ${dateStr} • ${startTime} - ${endTime}`;
    }

    return `📅 ${dateStr} • ${startTime}`;
  };

  const eventDate = formatEventDate(item.event_start_time, item.event_end_time);
  const hasDescription =
    item.event_description && item.event_description.trim().length > 0;

  return (
    <>
      <Box
        p={4}
        bg="purple.50"
        borderLeft="4px"
        borderColor="purple.500"
        _hover={{ bg: 'purple.100' }}
        transition="all 0.2s ease"
        position="relative"
        className="event-item-row"
      >
        <Flex justify="space-between" align="flex-start" gap={4}>
          <VStack align="start" gap={2} flex={1}>
            {/* Event Title */}
            <HStack gap={2}>
              <Badge colorPalette="purple" size="sm">
                Event
              </Badge>
              <Text fontWeight="semibold" fontSize="md">
                {item.name}
              </Text>
            </HStack>

            {/* Event Date/Time */}
            {eventDate && (
              <Text fontSize="sm" color="gray.700" fontWeight="medium">
                {eventDate}
              </Text>
            )}

            {/* Event Location (stored in details) */}
            {item.details && (
              <HStack gap={2}>
                <Text fontSize="sm" color="gray.600">
                  📍 {item.details}
                </Text>
              </HStack>
            )}

            {/* Event Description Toggle */}
            {hasDescription && (
              <Box>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="purple"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  {showDescription ? 'Hide' : 'Show'} Description
                </Button>
                {showDescription && (
                  <Text
                    fontSize="sm"
                    color="gray.700"
                    mt={2}
                    p={2}
                    bg="white"
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                  >
                    {item.event_description}
                  </Text>
                )}
              </Box>
            )}

            {/* View in Google Calendar Link */}
            {item.google_calendar_link && (
              <Box>
                <a
                  href={item.google_calendar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="xs" colorPalette="blue" variant="outline">
                    View in Google Calendar →
                  </Button>
                </a>
              </Box>
            )}
          </VStack>

          {/* Action Buttons */}
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              colorPalette="appPrimary"
              onClick={handleEditClick}
              data-edit-button
            >
              Edit
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={handleDeleteClick}
                data-delete-button
              >
                Delete
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event Item"
        message={`Are you sure you want to delete "${item.name}"? This will remove it from the board but not from your Google Calendar.`}
        confirmColorPalette="red"
      />
    </>
  );
});
