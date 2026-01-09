import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { MiniStatistics, IconBox } from 'components/local-grocery';
import { MdAttachMoney, MdBarChart, MdShoppingCart, MdInventory } from 'react-icons/md';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';
import reportsService from 'services/reports.service';
import productsService from 'services/products.service';
import salesService from 'services/sales.service';

function Dashboard() {
  // Use useContext directly to avoid throwing error if AuthProvider is not available
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    // Only load data if user is authenticated
    if (isAuthenticated) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayStartStr = today.toISOString().split('T')[0];
      const todayEndStr = todayEnd.toISOString().split('T')[0];

      // Load today's sales summary
      const salesSummary = await reportsService.getSalesSummary({
        startDate: todayStartStr,
        endDate: todayEndStr,
      });
      setTodaySales(salesSummary.totalSales);
      setTodayOrders(salesSummary.totalOrders);

      // Load products
      // Backend limit max 100, fetch first page for dashboard
      const productsResponse = await productsService.getProducts({ page: 1, limit: 100 });
      const products = productsResponse.data;
      setTotalProducts(products.length);
      
      // Count low stock items
      const lowStock = products.filter(
        (p) => p.stockQuantity <= p.minStockLevel && p.isActive
      );
      setLowStockCount(lowStock.length);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        {loading ? (
          <>
            <Skeleton height="120px" borderRadius="15px" />
            <Skeleton height="120px" borderRadius="15px" />
            <Skeleton height="120px" borderRadius="15px" />
            <Skeleton height="120px" borderRadius="15px" />
          </>
        ) : (
          <>
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={boxBg}
                  icon={<MdAttachMoney size="32px" color={brandColor} />}
                />
              }
              name="Today's Sales"
              value={`₺${todaySales.toFixed(2)}`}
            />
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={boxBg}
                  icon={<MdShoppingCart size="32px" color={brandColor} />}
                />
              }
              name="Today's Orders"
              value={todayOrders.toString()}
            />
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={boxBg}
                  icon={<MdInventory size="32px" color={brandColor} />}
                />
              }
              name="Total Products"
              value={totalProducts.toString()}
            />
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={boxBg}
                  icon={<MdBarChart size="32px" color={brandColor} />}
                />
              }
              name="Low Stock Items"
              value={lowStockCount.toString()}
            />
          </>
        )}
      </SimpleGrid>

      <Box>
        <Flex direction="column" gap="20px">
          <Box
            bg={useColorModeValue('white', 'navy.800')}
            borderRadius="15px"
            p="20px"
          >
            <Text fontSize="xl" fontWeight="bold" mb="10px">
              Welcome, {user?.firstName} {user?.lastName}!
            </Text>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              This is your Local Grocery Hub dashboard. Use the sidebar to navigate to different sections.
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export default Dashboard;

