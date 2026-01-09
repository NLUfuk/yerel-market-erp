import React, { useState, useContext } from 'react';
import { Portal, Box, useDisclosure, Alert, AlertIcon, AlertTitle, AlertDescription, Button, HStack, Text } from '@chakra-ui/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Footer, Navbar, Sidebar, SidebarResponsive } from 'components/local-grocery';
import { SidebarContext } from 'contexts/SidebarContext';
import { AuthContext } from 'contexts/AuthContext';
import routes, { RouteType } from 'routes';
import { MdClose } from 'react-icons/md';

// Import Dashboard directly - AdminLayout is already within AuthProvider
import Dashboard from 'views/admin/dashboard';
import ProductsListPage from 'views/admin/products/ProductsListPage';
import ProductFormPage from 'views/admin/products/ProductFormPage';
import CategoriesListPage from 'views/admin/categories/CategoriesListPage';
import CategoryFormPage from 'views/admin/categories/CategoryFormPage';
import SalesListPage from 'views/admin/sales/SalesListPage';
import CreateSalePage from 'views/admin/sales/CreateSalePage';
import EditSalePage from 'views/admin/sales/EditSalePage';
import SaleDetailPage from 'views/admin/sales/SaleDetailPage';
import ReportsPage from 'views/admin/reports/ReportsPage';
import UsersListPage from 'views/admin/users/UsersListPage';
import UserFormPage from 'views/admin/users/UserFormPage';
import TenantsListPage from 'views/admin/tenants/TenantsListPage';
import TenantFormPage from 'views/admin/tenants/TenantFormPage';
import StockMovementsListPage from 'views/admin/stock/StockMovementsListPage';
import CreateStockMovementPage from 'views/admin/stock/CreateStockMovementPage';
import AdjustStockPage from 'views/admin/stock/AdjustStockPage';

interface AdminLayoutProps {
  theme?: any;
  setTheme?: (theme: any) => void;
}

export default function AdminLayout({ theme, setTheme }: AdminLayoutProps) {
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { onOpen } = useDisclosure();
  const authContext = useContext(AuthContext);

  const getRoute = () => {
    return window.location.pathname !== '/admin/full-screen-maps';
  };

  const getActiveRoute = (routes: RouteType[]): string => {
    let activeRoute = 'Dashboard';
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].items || []);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].items || []);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes: RouteType[]): boolean => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbar(routes[i].items || []);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].items || []);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].secondary || false;
        }
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes: RouteType[]): React.ReactElement[] => {
    return routes.flatMap((route, key) => {
      if (route.collapse && route.items) {
        return getRoutes(route.items);
      }
      if (route.category && route.items) {
        return getRoutes(route.items);
      }
      if (route.layout === '/admin') {
        // Skip Dashboard as it's defined in App.tsx
        if (route.path === '/dashboard') {
          return [];
        }
        const Component = route.component;
        if (!Component) {
          return [];
        }
        return (
          <Route
            path={`${route.path}`}
            element={<Component />}
            key={key}
          />
        );
      }
      return [];
    });
  };

  document.documentElement.dir = 'ltr';

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Sidebar routes={routes} display="none" />
        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                logoText="Local Grocery Hub"
                brandText={getActiveRoute(routes)}
                secondary={getActiveNavbar(routes)}
                message={false}
                fixed={fixed}
              />
            </Box>
          </Portal>

          {getRoute() ? (
            <Box
              mx="auto"
              p={{ base: '20px', md: '30px' }}
              pe="20px"
              minH="100vh"
              pt="50px"
            >
              {/* Impersonation Banner */}
              {authContext?.isImpersonating && authContext.originalUser && (
                <Alert
                  status="warning"
                  variant="left-accent"
                  mb="20px"
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Impersonating User</AlertTitle>
                    <AlertDescription>
                      <HStack spacing={2} align="center">
                        <Text fontSize="sm">
                          You are currently viewing as{' '}
                          <strong>
                            {authContext.user?.firstName} {authContext.user?.lastName}
                          </strong>
                          . Original user:{' '}
                          <strong>
                            {authContext.originalUser.firstName}{' '}
                            {authContext.originalUser.lastName}
                          </strong>
                          .
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="orange"
                          variant="solid"
                          onClick={() => {
                            if (authContext.stopImpersonating) {
                              authContext.stopImpersonating();
                              window.location.href = '/admin/dashboard';
                            }
                          }}
                          leftIcon={<MdClose />}
                        >
                          Stop Impersonating
                        </Button>
                      </HStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              <Routes>
                {/* Dashboard route - defined directly to ensure AuthProvider context */}
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Products routes */}
                <Route path="/products" element={<ProductsListPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id" element={<ProductFormPage />} />
                {/* Categories routes */}
                <Route path="/categories" element={<CategoriesListPage />} />
                <Route path="/categories/new" element={<CategoryFormPage />} />
                <Route path="/categories/:id" element={<CategoryFormPage />} />
                {/* Sales routes */}
                <Route path="/sales" element={<SalesListPage />} />
                <Route path="/sales/new" element={<CreateSalePage />} />
                <Route path="/sales/:id/edit" element={<EditSalePage />} />
                <Route path="/sales/:id" element={<SaleDetailPage />} />
                {/* Reports routes */}
                <Route path="/reports" element={<ReportsPage />} />
                {/* Users routes */}
                <Route path="/users" element={<UsersListPage />} />
                <Route path="/users/new" element={<UserFormPage />} />
                <Route path="/users/:id" element={<UserFormPage />} />
                {/* Tenants routes */}
                <Route path="/tenants" element={<TenantsListPage />} />
                <Route path="/tenants/new" element={<TenantFormPage />} />
                <Route path="/tenants/:id" element={<TenantFormPage />} />
                {/* Stock routes */}
                <Route path="/stock/movements" element={<StockMovementsListPage />} />
                <Route path="/stock/movements/new" element={<CreateStockMovementPage />} />
                <Route path="/stock/adjust/:productId" element={<AdjustStockPage />} />
                {getRoutes(routes)}
                <Route
                  path="/"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
              </Routes>
            </Box>
          ) : null}
          <Box>
            <Footer />
          </Box>
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}

