import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  useToast,
  Text,
  Input,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
} from '@chakra-ui/react';
import { MiniStatistics, IconBox, Card } from 'components/local-grocery';
import { MdAttachMoney, MdShoppingCart, MdTrendingUp, MdBarChart } from 'react-icons/md';
import { SalesSummaryResponse, TopProductsResponse } from 'types/reports';
import reportsService from 'services/reports.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const ReportsPage: React.FC = () => {
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [salesSummary, setSalesSummary] = useState<SalesSummaryResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsResponse | null>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  useEffect(() => {
    if (startDate && endDate) {
      loadReports();
    }
  }, [startDate, endDate]);

  const loadReports = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: 'Error',
        description: 'Start date must be before end date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const [summary, products] = await Promise.all([
        reportsService.getSalesSummary({ startDate, endDate }),
        reportsService.getTopProducts({ startDate, endDate, limit: 10 }),
      ]);
      setSalesSummary(summary);
      setTopProducts(products);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load reports',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (percentage: number): string => {
    if (percentage > 0) return 'green.500';
    if (percentage < 0) return 'red.500';
    return 'gray.500';
  };

  const getGrowthIcon = (percentage: number) => {
    if (percentage > 0) return '↑';
    if (percentage < 0) return '↓';
    return '→';
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex direction="column" gap="20px">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap">
          <Heading color={textColor} fontSize="2xl" fontWeight="700">
            Reports
          </Heading>
        </Flex>

        {/* Date Filters */}
        <Card p="20px">
          <Flex gap="20px" wrap="wrap" align="end">
            <Box>
              <Text fontSize="sm" mb="5px" color={textColor} fontWeight="500">
                Start Date
              </Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="md"
                w="200px"
              />
            </Box>
            <Box>
              <Text fontSize="sm" mb="5px" color={textColor} fontWeight="500">
                End Date
              </Text>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="md"
                w="200px"
              />
            </Box>
            <Button
              colorScheme="brand"
              onClick={loadReports}
              isLoading={loading}
              loadingText="Loading..."
            >
              Generate Report
            </Button>
          </Flex>
        </Card>

        {/* Sales Summary Cards */}
        {salesSummary && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px">
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={boxBg}
                  icon={<MdAttachMoney size="32px" color={brandColor} />}
                />
              }
              name="Total Sales"
              value={`₺${salesSummary.totalSales.toFixed(2)}`}
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
              name="Total Orders"
              value={salesSummary.totalOrders.toString()}
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
              name="Average Daily"
              value={`₺${salesSummary.averageDaily.toFixed(2)}`}
            />
            <MiniStatistics
              startContent={
                <IconBox
                  w="56px"
                  h="56px"
                  bg={boxBg}
                  icon={<MdTrendingUp size="32px" color={brandColor} />}
                />
              }
              name="Growth"
              value={`${getGrowthIcon(salesSummary.growthPercentage)} ${Math.abs(salesSummary.growthPercentage).toFixed(2)}%`}
              growth={
                salesSummary.growthPercentage > 0
                  ? `+${salesSummary.growthPercentage.toFixed(2)}%`
                  : salesSummary.growthPercentage < 0
                  ? `${salesSummary.growthPercentage.toFixed(2)}%`
                  : '0%'
              }
            />
          </SimpleGrid>
        )}

        {/* Daily Breakdown */}
        {salesSummary && salesSummary.dailyBreakdown.length > 0 && (
          <Card p="30px">
            <Heading size="md" color={textColor} mb="20px">
              Daily Breakdown
            </Heading>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th isNumeric>Sales</Th>
                    <Th isNumeric>Orders</Th>
                    <Th isNumeric>Average Order</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {salesSummary.dailyBreakdown.map((day) => (
                    <Tr key={day.date}>
                      <Td>
                        <Text fontWeight="600">
                          {new Date(day.date).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text fontWeight="600" color={brandColor}>
                          ₺{day.sales.toFixed(2)}
                        </Text>
                      </Td>
                      <Td isNumeric>{day.orders}</Td>
                      <Td isNumeric>₺{day.averageOrder.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Top Products */}
        {topProducts && topProducts.products.length > 0 && (
          <Card p="30px">
            <Flex justify="space-between" align="center" mb="20px">
              <Heading size="md" color={textColor}>
                Top Products
              </Heading>
              <Text fontSize="sm" color={textColor}>
                Total Revenue: ₺{topProducts.totalRevenue.toFixed(2)}
              </Text>
            </Flex>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Rank</Th>
                    <Th>Product</Th>
                    <Th isNumeric>Quantity Sold</Th>
                    <Th isNumeric>Revenue</Th>
                    <Th isNumeric>% of Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topProducts.products.map((product, index) => (
                    <Tr key={product.productId}>
                      <Td>
                        <Badge colorScheme="brand">{index + 1}</Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="600">{product.productName}</Text>
                      </Td>
                      <Td isNumeric>{product.salesQuantity.toFixed(2)}</Td>
                      <Td isNumeric>
                        <Text fontWeight="600" color={brandColor}>
                          ₺{product.revenue.toFixed(2)}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        {product.percentageOfTotal.toFixed(2)}%
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !salesSummary && !topProducts && (
          <Card p="40px" textAlign="center">
            <Text color={textColor} fontSize="md">
              Select date range and click "Generate Report" to view reports
            </Text>
          </Card>
        )}
      </Flex>
    </Box>
  );
};

export default ReportsPage;

