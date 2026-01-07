import { IconButton } from "@chakra-ui/react"
import * as React from "react"

export interface CloseButtonProps extends IconButton.RootProps {}

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton(props, ref) {
  const { children, ...rest } = props
  return (
    <IconButton variant="ghost" aria-label="Close" ref={ref} {...rest}>
      {children || (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </IconButton>
  )
})
