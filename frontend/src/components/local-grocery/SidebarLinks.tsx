import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { RouteType } from 'routes';
import { AuthContext } from 'contexts/AuthContext';

interface SidebarLinksProps {
  routes: RouteType[];
}

/**
 * SidebarLinks Component
 * Renders navigation links in the sidebar
 */
export const SidebarLinks: React.FC<SidebarLinksProps> = ({ routes }) => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const activeColor = useColorModeValue('gray.700', 'white');
  const inactiveColor = useColorModeValue('secondaryGray.600', 'secondaryGray.600');
  const activeIcon = useColorModeValue('brand.500', 'white');
  const textColor = useColorModeValue('secondaryGray.500', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  // Verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string): boolean => {
    return location.pathname.includes(routeName);
  };

  // Check if user has permission to see this route
  const canAccessRoute = (route: RouteType): boolean => {
    if (!route.allowedRoles || route.allowedRoles.length === 0) {
      return true; // No restrictions
    }
    if (!authContext?.user) {
      return false;
    }
    // Check if user has any of the required roles
    const userRoles = authContext.user.roles || [];
    return route.allowedRoles.some((role) => userRoles.includes(role));
  };

  // This function creates the links from the secondary accordions
  const createLinks = (routes: RouteType[]): React.ReactNode[] => {
    return routes
      .filter((route) => canAccessRoute(route))
      .map((route, index) => {
        if (route.collapse && route.items) {
          return (
            <React.Fragment key={index}>
              <Text
                fontSize="md"
                color={activeColor}
                fontWeight="bold"
                mx="auto"
                ps={{
                  sm: '10px',
                  xl: '16px',
                }}
                pt="18px"
                pb="12px"
              >
                {route.name}
              </Text>
              {createLinks(route.items || [])}
            </React.Fragment>
          );
        } else if (route.category && route.items) {
          return (
            <React.Fragment key={index}>
              <Text
                fontSize="md"
                color={activeColor}
                fontWeight="bold"
                mx="auto"
                ps={{
                  sm: '10px',
                  xl: '16px',
                }}
                pt="18px"
                pb="12px"
              >
                {route.name}
              </Text>
              {createLinks(route.items || [])}
            </React.Fragment>
          );
        } else if (
          route.layout === '/admin' ||
          route.layout === '/auth' ||
          route.layout === '/rtl'
        ) {
        return (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={activeRoute(route.path.toLowerCase()) ? '22px' : '26px'}
                  py="5px"
                  ps="10px"
                >
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase()) ? activeIcon : textColor
                      }
                      me="18px"
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        activeRoute(route.path.toLowerCase()) ? activeColor : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase()) ? 'bold' : 'normal'
                      }
                    >
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h="36px"
                    w="4px"
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor
                        : 'transparent'
                    }
                    borderRadius="5px"
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={activeRoute(route.path.toLowerCase()) ? '22px' : '26px'}
                  py="5px"
                  ps="10px"
                >
                  <Text
                    me="auto"
                    color={
                      activeRoute(route.path.toLowerCase()) ? activeColor : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? 'bold' : 'normal'
                    }
                  >
                    {route.name}
                  </Text>
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </NavLink>
        );
      }
      return null;
    });
  };

  return <>{createLinks(routes)}</>;
};

export default SidebarLinks;

