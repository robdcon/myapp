import { Alert } from "@chakra-ui/react";

interface ErrorAlertProps {
  title?: string;
  message: string;
}

export function ErrorAlert({ title = "Error", message }: ErrorAlertProps) {
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
