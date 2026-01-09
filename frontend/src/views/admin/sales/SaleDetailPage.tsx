import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  useToast,
  Badge,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdPrint, MdEdit, MdDelete } from 'react-icons/md';
import Card from 'components/local-grocery/Card';
import { Sale, PaymentMethod } from 'types/sales';
import salesService from 'services/sales.service';
import { AuthContext } from 'contexts/AuthContext';

const SaleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Safe role check
  const hasRole = (role: string): boolean => {
    if (!authContext?.user) return false;
    return authContext.user.roles.includes(role);
  };
  const canEdit = hasRole('TenantAdmin') || hasRole('SuperAdmin');

  useEffect(() => {
    if (id) {
      loadSale();
    }
  }, [id]);

  const loadSale = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await salesService.getSale(id);
      setSale(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load sale details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/sales');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const colorMap = {
      [PaymentMethod.CASH]: 'green',
      [PaymentMethod.CARD]: 'blue',
      [PaymentMethod.MIXED]: 'purple',
    };
    return (
      <Badge colorScheme={colorMap[method] || 'gray'} fontSize="md" p="5px 10px">
        {method}
      </Badge>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!sale) {
    return null;
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex direction="column" gap="20px">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap">
          <HStack spacing="20px">
            <Button
              leftIcon={<MdArrowBack />}
              variant="ghost"
              onClick={() => navigate('/admin/sales')}
            >
              Back to Sales
            </Button>
            <Heading color={textColor} fontSize="2xl" fontWeight="700">
              Sale Details
            </Heading>
          </HStack>
          <HStack spacing="10px">
            <Button
              leftIcon={<MdEdit />}
              colorScheme="blue"
              onClick={() => navigate(`/admin/sales/${id}/edit`)}
              isDisabled={!canEdit}
            >
              Edit
            </Button>
            <Button
              leftIcon={<MdDelete />}
              colorScheme="red"
              onClick={onOpen}
              isDisabled={!canEdit}
            >
              Delete
            </Button>
            <Button
              leftIcon={<MdPrint />}
              colorScheme="brand"
              onClick={handlePrint}
            >
              Print Invoice
            </Button>
          </HStack>
        </Flex>

        {/* Sale Information Card */}
        <Card p="30px">
          <Flex direction="column" gap="20px">
            {/* Sale Header */}
            <Flex justify="space-between" align="start" wrap="wrap">
              <Box>
                <Text fontSize="sm" color="gray.500" mb="5px">
                  Sale Number
                </Text>
                <Heading size="lg" color={textColor}>
                  {sale.saleNumber}
                </Heading>
              </Box>
              <Box textAlign="right">
                <Text fontSize="sm" color="gray.500" mb="5px">
                  Date
                </Text>
                <Text fontWeight="600" color={textColor}>
                  {new Date(sale.createdAt).toLocaleString()}
                </Text>
              </Box>
            </Flex>

            <Divider />

            {/* Payment Method */}
            <Flex justify="space-between" align="center">
              <Text fontSize="md" color="gray.600">
                Payment Method:
              </Text>
              {getPaymentMethodBadge(sale.paymentMethod)}
            </Flex>

            {sale.cashierName && (
              <Flex justify="space-between" align="center">
                <Text fontSize="md" color="gray.600">
                  Cashier:
                </Text>
                <Text fontWeight="600" color={textColor}>
                  {sale.cashierName}
                </Text>
              </Flex>
            )}

            <Divider />

            {/* Items Table */}
            <Box>
              <Heading size="md" mb="20px" color={textColor}>
                Items
              </Heading>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th isNumeric>Quantity</Th>
                      <Th isNumeric>Unit Price</Th>
                      <Th isNumeric>Discount</Th>
                      <Th isNumeric>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sale.items.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          <Text fontWeight="600">{item.productName || 'Unknown Product'}</Text>
                        </Td>
                        <Td isNumeric>{item.quantity.toFixed(2)}</Td>
                        <Td isNumeric>₺{item.unitPrice.toFixed(2)}</Td>
                        <Td isNumeric>
                          {item.discountAmount > 0 ? (
                            <Text color="red.500">-₺{item.discountAmount.toFixed(2)}</Text>
                          ) : (
                            <Text color="gray.400">₺0.00</Text>
                          )}
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="600">₺{item.lineTotal.toFixed(2)}</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>

            <Divider />

            {/* Summary */}
            <Flex direction="column" align="flex-end" gap="10px">
              <Flex justify="space-between" w="300px">
                <Text fontSize="md" color="gray.600">
                  Subtotal:
                </Text>
                <Text fontSize="md" fontWeight="600" color={textColor}>
                  ₺{sale.totalAmount.toFixed(2)}
                </Text>
              </Flex>
              {sale.discountAmount > 0 && (
                <Flex justify="space-between" w="300px">
                  <Text fontSize="md" color="gray.600">
                    Discount:
                  </Text>
                  <Text fontSize="md" fontWeight="600" color="red.500">
                    -₺{sale.discountAmount.toFixed(2)}
                  </Text>
                </Flex>
              )}
              <Divider w="300px" />
              <Flex justify="space-between" w="300px">
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Total:
                </Text>
                <Text fontSize="xl" fontWeight="700" color={brandColor}>
                  ₺{sale.finalAmount.toFixed(2)}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button {
              display: none !important;
            }
          }
        `}
      </style>

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
              Are you sure you want to delete sale <strong>{sale?.saleNumber}</strong>? This
              will cancel the sale and restore stock quantities. This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={async () => {
                  if (!sale) return;
                  try {
                    await salesService.deleteSale(sale.id);
                    toast({
                      title: 'Success',
                      description: 'Sale deleted successfully',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                    onClose();
                    navigate('/admin/sales');
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

export default SaleDetailPage;

