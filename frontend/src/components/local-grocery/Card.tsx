import { Box, BoxProps, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

interface CardProps extends BoxProps {
  variant?: string;
  children: React.ReactNode;
}

/**
 * Card Component
 * Reusable card component for displaying content
 */
export const Card: React.FC<CardProps> = ({ variant, children, ...rest }) => {
  const styles = useStyleConfig('Card', { variant });

  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
};

export default Card;

