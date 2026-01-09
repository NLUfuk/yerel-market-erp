import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  useToast,
  Badge,
  Text,
  Input,
  HStack,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { DataTable, Pagination } from 'components/local-grocery';
import { Sale, PaymentMethod } from 'types/sales';
import salesService from 'services/sales.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const SalesListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  const hasRole = (role: string): boolean => {
    if (!authContext?.user) return false;
    return authContext.user.roles.includes(role);
  };
  const canEdit = hasRole('TenantAdmin') || hasRole('Cashier');

  useEffect(() => {
    loadSales();
  }, [page, limit, startDate, endDate]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }
      if (paymentMethodFilter) {
        params.paymentMethod = paymentMethodFilter;
      }
      const response = await salesService.getSales(params);
      setSales(response.data);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load sales',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (sale: Sale) => {
    navigate(`/admin/sales/${sale.id}`);
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const colorMap = {
      [PaymentMethod.CASH]: 'green',
      [PaymentMethod.CARD]: 'blue',
      [PaymentMethod.MIXED]: 'purple',
    };
    return (
      <Badge colorScheme={colorMap[method] || 'gray'}>
        {method}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Sale Number',
      accessor: (sale: Sale) => (
        <Text fontWeight="600" color={textColor}>
          {sale.saleNumber}
        </Text>
      ),
    },
    {
      header: 'Date',
      accessor: (sale: Sale) => (
        <Text color={textColor} fontSize="sm">
          {new Date(sale.createdAt).toLocaleString()}
        </Text>
      ),
    },
    {
      header: 'Items',
      accessor: (sale: Sale) => (
        <Text color={textColor} fontSize="sm">
          {sale.items.length} item(s)
        </Text>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (sale: Sale) => (
        <Text fontWeight="600" color={textColor}>
          ₺{sale.totalAmount.toFixed(2)}
        </Text>
      ),
    },
    {
      header: 'Discount',
      accessor: (sale: Sale) => (
        <Text color={textColor} fontSize="sm">
          ₺{sale.discountAmount.toFixed(2)}
        </Text>
      ),
    },
    {
      header: 'Final Amount',
      accessor: (sale: Sale) => (
        <Text fontWeight="700" color={brandColor} fontSize="md">
          ₺{sale.finalAmount.toFixed(2)}
        </Text>
      ),
    },
    {
      header: 'Payment Method',
      accessor: (sale: Sale) => getPaymentMethodBadge(sale.paymentMethod),
    },
    {
      header: 'Cashier',
      accessor: (sale: Sale) => (
        <Text color={textColor} fontSize="sm">
          {sale.cashierName || 'N/A'}
        </Text>
      ),
    },
    {
      header: 'Actions',
      accessor: (sale: Sale) => (
        <HStack spacing="10px">
          <Button
            size="sm"
            leftIcon={<MdEdit />}
            colorScheme="blue"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/sales/${sale.id}/edit`);
            }}
            isDisabled={!canEdit}
          >
            Edit
          </Button>
          <Button
            size="sm"
            leftIcon={<MdDelete />}
            colorScheme="red"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSaleToDelete(sale);
              onOpen();
            }}
            isDisabled={!canEdit}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex direction="column" gap="20px">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap">
          <Heading color={textColor} fontSize="2xl" fontWeight="700">
            Sales
          </Heading>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={() => navigate('/admin/sales/new')}
          >
            New Sale
          </Button>
        </Flex>

        {/* Filters */}
        <Flex gap="20px" wrap="wrap" align="end">
          <Box>
            <Text fontSize="sm" mb="5px" color={textColor}>
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
            <Text fontSize="sm" mb="5px" color={textColor}>
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
          <Box>
            <Text fontSize="sm" mb="5px" color={textColor}>
              Payment Method
            </Text>
            <Select
              placeholder="All Methods"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              size="md"
              w="150px"
            >
              <option value="">All</option>
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.CARD}>Card</option>
              <option value={PaymentMethod.MIXED}>Mixed</option>
            </Select>
          </Box>
          <Button
            variant="outline"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setPaymentMethodFilter('');
            }}
          >
            Clear Filters
          </Button>
        </Flex>

        {/* Sales Table */}
        <DataTable
          columns={columns}
          data={sales}
          loading={loading}
          emptyMessage="No sales found"
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Sale
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete sale <strong>{saleToDelete?.saleNumber}</strong>?
              This will cancel the sale and restore stock quantities. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={async () => {
                  if (!saleToDelete) return;
                  try {
                    await salesService.deleteSale(saleToDelete.id);
                    toast({
                      title: 'Success',
                      description: 'Sale deleted successfully',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                    onClose();
                    setSaleToDelete(null);
                    loadSales();
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: error.response?.data?.message || 'Failed to delete sale',
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    });
                  }
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SalesListPage;

