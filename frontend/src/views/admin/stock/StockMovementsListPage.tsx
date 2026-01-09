import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  useToast,
  Badge,
  Select,
  HStack,
  Text,
  Input,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { DataTable } from 'components/local-grocery';
import { StockMovement, StockMovementType } from 'types/stock';
import stockService from 'services/stock.service';
import productsService from 'services/products.service';
import { Product } from 'types/products';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const StockMovementsListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  const hasRole = (role: string): boolean => {
    if (!authContext?.user) return false;
    return authContext.user.roles.includes(role);
  };
  const canCreate = hasRole('TenantAdmin') || hasRole('Cashier');

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, []);

  useEffect(() => {
    loadMovements();
  }, [selectedProductId, selectedMovementType, startDate, endDate]);

  const loadProducts = async () => {
    try {
      const response = await productsService.getProducts({ limit: 100 });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedProductId) {
        params.productId = selectedProductId;
      }
      if (selectedMovementType) {
        params.movementType = selectedMovementType;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const data = await stockService.getStockMovements(params);
      setMovements(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load stock movements',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeBadge = (type: StockMovementType) => {
    const colorMap = {
      [StockMovementType.PURCHASE]: 'green',
      [StockMovementType.SALE]: 'red',
      [StockMovementType.ADJUSTMENT]: 'blue',
      [StockMovementType.RETURN]: 'orange',
    };
    return (
      <Badge colorScheme={colorMap[type] || 'gray'} fontSize="xs">
        {type}
      </Badge>
    );
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown';
  };

  const columns = [
    {
      header: 'Date',
      accessor: (movement: StockMovement) => (
        <Text fontSize="sm">
          {new Date(movement.createdAt).toLocaleString()}
        </Text>
      ),
    },
    {
      header: 'Product',
      accessor: (movement: StockMovement) => (
        <Text fontWeight="600" color={textColor}>
          {movement.productName || getProductName(movement.productId)}
        </Text>
      ),
    },
    {
      header: 'Type',
      accessor: (movement: StockMovement) => getMovementTypeBadge(movement.movementType),
    },
    {
      header: 'Quantity',
      accessor: (movement: StockMovement) => (
        <Text
          fontWeight="600"
          color={movement.quantity >= 0 ? 'green.500' : 'red.500'}
        >
          {movement.quantity > 0 ? '+' : ''}
          {movement.quantity}
        </Text>
      ),
      isNumeric: true,
    },
    {
      header: 'Unit Price',
      accessor: (movement: StockMovement) => (
        <Text>₺{movement.unitPrice.toFixed(2)}</Text>
      ),
      isNumeric: true,
    },
    {
      header: 'Reference',
      accessor: (movement: StockMovement) => (
        <Text fontSize="sm" color="gray.500">
          {movement.referenceNumber || movement.referenceId || '-'}
        </Text>
      ),
    },
    {
      header: 'Notes',
      accessor: (movement: StockMovement) => (
        <Text fontSize="sm" noOfLines={1}>
          {movement.notes || '-'}
        </Text>
      ),
    },
    {
      header: 'Created By',
      accessor: (movement: StockMovement) => (
        <Text fontSize="sm">{movement.createdByName || movement.createdBy}</Text>
      ),
    },
  ];

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="20px">
        <Heading size="lg" color={textColor}>
          Stock Movements
        </Heading>
        {canCreate && (
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={() => navigate('/admin/stock/movements/new')}
          >
            New Movement
          </Button>
        )}
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap="20px" mb="20px" wrap="wrap">
        <Box w={{ base: '100%', md: '200px' }}>
          <Select
            placeholder="All Products"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box w={{ base: '100%', md: '180px' }}>
          <Select
            placeholder="All Types"
            value={selectedMovementType}
            onChange={(e) => setSelectedMovementType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value={StockMovementType.PURCHASE}>Purchase</option>
            <option value={StockMovementType.SALE}>Sale</option>
            <option value={StockMovementType.ADJUSTMENT}>Adjustment</option>
            <option value={StockMovementType.RETURN}>Return</option>
          </Select>
        </Box>
        <Box w={{ base: '100%', md: '150px' }}>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
          />
        </Box>
        <Box w={{ base: '100%', md: '150px' }}>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
          />
        </Box>
      </Flex>

      <DataTable
        columns={columns}
        data={movements}
        loading={loading}
        emptyMessage="No stock movements found"
      />
    </Box>
  );
};

export default StockMovementsListPage;
