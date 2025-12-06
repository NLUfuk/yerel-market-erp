import React from "react";

// Chakra imports
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  return (
    <Flex align='center' direction='column'>
      <Text
        fontSize='xl'
        fontWeight='bold'
        color={brandColor}
        my='32px'
        letterSpacing='tight'
      >
        Local Grocery Hub
      </Text>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
