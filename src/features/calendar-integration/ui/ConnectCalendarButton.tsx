'use client';

import { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';

interface ConnectCalendarButtonProps {
  boardId: string;
  onConnectionSuccess: () => void;
  disabled?: boolean;
}

export function ConnectCalendarButton({
  boardId,
  onConnectionSuccess,
  disabled = false,
}: ConnectCalendarButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Listen for OAuth callback messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin matches our app
      if (event.origin !== globalThis.location.origin) {
        return;
      }

      if (event.data.type === 'oauth-callback') {
        setIsConnecting(false);

        if (event.data.success) {
          toaster.create({
            title: 'Google Calendar Connected',
            description: 'Now select which calendar to sync with this board',
            type: 'success',
            duration: 5000,
          });
          onConnectionSuccess();
        } else {
          toaster.create({
            title: 'Connection Failed',
            description: event.data.error || 'Failed to connect Google Calendar',
            type: 'error',
            duration: 7000,
          });
        }
      }
    };

    globalThis.addEventListener('message', handleMessage);
    return () => globalThis.removeEventListener('message', handleMessage);
  }, [onConnectionSuccess]);

  const handleConnect = () => {
    setIsConnecting(true);

    // Open OAuth flow in popup window
    const width = 600;
    const height = 700;
    const left = globalThis.screen.width / 2 - width / 2;
    const top = globalThis.screen.height / 2 - height / 2;

    const popup = globalThis.open(
      `/api/auth/google/connect?boardId=${boardId}`,
      'googleOAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0`
    );

    // Check if popup was blocked
    if (!popup) {
      toaster.create({
        title: 'Popup Blocked',
        description: 'Please allow popups for this site to connect Google Calendar',
        type: 'error',
        duration: 7000,
      });
      setIsConnecting(false);
      return;
    }

    // Poll to detect if user closed popup without completing OAuth
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setIsConnecting(false);
        // Don't show error if popup was closed - user may have canceled intentionally
      }
    }, 500);
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={disabled || isConnecting}
      loading={isConnecting}
      colorPalette="blue"
      size="lg"
    >
      {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
    </Button>
  );
}
