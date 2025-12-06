import React from 'react';
import { Box, Flex, Stack } from '@chakra-ui/react';
import { RouteType } from 'routes';
import SidebarBrand from './SidebarBrand';
import SidebarLinks from './SidebarLinks';

interface SidebarContentProps {
  routes: RouteType[];
}

/**
 * SidebarContent Component
 * Main content container for the sidebar
 */
export const SidebarContent: React.FC<SidebarContentProps> = ({ routes }) => {
  return (
    <Flex direction="column" height="100%" pt="25px" px="16px" borderRadius="30px">
      <SidebarBrand />
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="20px" pe={{ md: '16px', '2xl': '1px' }}>
          <SidebarLinks routes={routes} />
        </Box>
      </Stack>
    </Flex>
  );
};

export default SidebarContent;

