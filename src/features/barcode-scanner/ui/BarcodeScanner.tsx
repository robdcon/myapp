'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga, { QuaggaJSResultObject } from '@ericblade/quagga2';
import { Box, VStack, Text, IconButton, Spinner } from '@chakra-ui/react';
import { LuX, LuScanLine } from 'react-icons/lu';

export interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

interface DecodedCode {
  error?: number;
}

export function BarcodeScanner({
  onScan,
  onClose,
  isProcessing = false,
}: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDetected = useCallback(
    (result: QuaggaJSResultObject) => {
      const code = result.codeResult?.code;
      if (!code || isProcessing) return;

      // Debounce: ignore same code scanned within 2 seconds
      if (lastScannedRef.current === code) return;

      // Validate code quality - require high confidence
      const decodedCodes = result.codeResult?.decodedCodes as DecodedCode[] | undefined;
      const errors =
        decodedCodes
          ?.filter((d: DecodedCode) => d.error !== undefined)
          ?.map((d: DecodedCode) => d.error as number) ?? [];

      if (errors.length > 0) {
        const avgError =
          errors.reduce((a: number, b: number) => a + b, 0) / errors.length;
        if (avgError > 0.1) return; // Skip low confidence scans
      }

      lastScannedRef.current = code;

      // Reset last scanned after 2 seconds to allow re-scanning same item
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      scanTimeoutRef.current = setTimeout(() => {
        lastScannedRef.current = null;
      }, 2000);

      onScan(code);
    },
    [onScan, isProcessing]
  );

  useEffect(() => {
    if (!scannerRef.current) return;

    const initScanner = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        await Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              target: scannerRef.current!,
              constraints: {
                facingMode: 'environment', // Use rear camera
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
              },
            },
            locator: {
              patchSize: 'medium',
              halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
              readers: [
                'ean_reader', // EAN-13
                'ean_8_reader', // EAN-8
                'upc_reader', // UPC-A
                'upc_e_reader', // UPC-E
                'code_128_reader', // Code 128 (common in retail)
              ],
            },
            locate: true,
            frequency: 10, // Process 10 frames per second
          },
          (err) => {
            if (err) {
              console.error('Quagga init error:', err);
              setError(getCameraErrorMessage(err));
              setIsInitializing(false);
              return;
            }
            Quagga.start();
            setIsInitializing(false);
          }
        );

        Quagga.onDetected(handleDetected);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError('Failed to initialize camera');
        setIsInitializing(false);
      }
    };

    initScanner();

    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [handleDetected]);

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="black" zIndex={1000}>
      {/* Close button */}
      <IconButton
        aria-label="Close scanner"
        position="absolute"
        top={4}
        right={4}
        zIndex={1001}
        colorPalette="whiteAlpha"
        variant="solid"
        bg="blackAlpha.600"
        color="white"
        rounded="full"
        onClick={onClose}
        disabled={isProcessing}
      >
        <LuX size={24} />
      </IconButton>

      {/* Scanner viewport */}
      <Box
        ref={scannerRef}
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        overflow="hidden"
        css={{
          '& video': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
          '& canvas': {
            display: 'none', // Hide Quagga's canvas overlay
          },
        }}
      />

      {/* Viewfinder overlay */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="280px"
        height="150px"
        border="2px solid"
        borderColor={isProcessing ? 'yellow.400' : 'white'}
        borderRadius="lg"
        pointerEvents="none"
        transition="border-color 0.2s"
      >
        {/* Corner accents */}
        <Box
          position="absolute"
          top="-2px"
          left="-2px"
          w="20px"
          h="20px"
          borderTop="4px solid"
          borderLeft="4px solid"
          borderColor="appPrimary.500"
          borderTopLeftRadius="lg"
        />
        <Box
          position="absolute"
          top="-2px"
          right="-2px"
          w="20px"
          h="20px"
          borderTop="4px solid"
          borderRight="4px solid"
          borderColor="appPrimary.500"
          borderTopRightRadius="lg"
        />
        <Box
          position="absolute"
          bottom="-2px"
          left="-2px"
          w="20px"
          h="20px"
          borderBottom="4px solid"
          borderLeft="4px solid"
          borderColor="appPrimary.500"
          borderBottomLeftRadius="lg"
        />
        <Box
          position="absolute"
          bottom="-2px"
          right="-2px"
          w="20px"
          h="20px"
          borderBottom="4px solid"
          borderRight="4px solid"
          borderColor="appPrimary.500"
          borderBottomRightRadius="lg"
        />
      </Box>

      {/* Status overlay */}
      <VStack
        position="absolute"
        bottom={8}
        left="50%"
        transform="translateX(-50%)"
        gap={2}
        color="white"
        textAlign="center"
      >
        {isInitializing && (
          <>
            <Spinner size="lg" color="white" />
            <Text fontSize="sm">Starting camera...</Text>
          </>
        )}
        {!isInitializing && !error && !isProcessing && (
          <>
            <LuScanLine size={24} />
            <Text fontSize="sm">Point camera at barcode</Text>
          </>
        )}
        {isProcessing && (
          <>
            <Spinner size="lg" color="yellow.400" />
            <Text fontSize="sm">Looking up product...</Text>
          </>
        )}
        {error && (
          <Text fontSize="sm" color="red.400">
            {error}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

function getCameraErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'NotAllowedError') {
      return 'Camera permission denied. Please allow camera access.';
    }
    if (err.name === 'NotFoundError') {
      return 'No camera found on this device.';
    }
    if (err.name === 'NotReadableError') {
      return 'Camera is in use by another app.';
    }
    return err.message;
  }
  return 'Failed to access camera';
}
