import React from 'react';
import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { HSeparator } from 'components/separator/Separator';

/**
 * SidebarBrand Component
 * Displays the application brand/logo in the sidebar
 */
export const SidebarBrand: React.FC = () => {
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  return (
    <Flex align="center" direction="column">
      <Text
        fontSize="xl"
        fontWeight="bold"
        color={brandColor}
        my="32px"
        letterSpacing="tight"
      >
        Local Grocery Hub
      </Text>
      <HSeparator mb="20px" />
    </Flex>
  );
};

export default SidebarBrand;

