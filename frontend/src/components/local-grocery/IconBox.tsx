import { Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';

interface IconBoxProps extends FlexProps {
  icon: React.ReactNode;
}

/**
 * IconBox Component
 * Circular container for icons
 */
export const IconBox: React.FC<IconBoxProps> = ({ icon, ...rest }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      borderRadius="50%"
      {...rest}
    >
      {icon}
    </Flex>
  );
};

export default IconBox;

