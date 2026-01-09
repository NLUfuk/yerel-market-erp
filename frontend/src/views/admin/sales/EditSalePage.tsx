import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  useColorModeValue,
  Text,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdDelete, MdShoppingCart, MdRemove } from 'react-icons/md';
import Card from 'components/local-grocery/Card';
import { Product } from 'types/products';
import { PaymentMethod, CreateSaleItemRequest, UpdateSaleRequest } from 'types/sales';
import productsService from 'services/products.service';
import salesService from 'services/sales.service';

interface SaleItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

const EditSalePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingSale, setLoadingSale] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItemForm[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [totalDiscount, setTotalDiscount] = useState(0);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  useEffect(() => {
    loadProducts();
    if (id) {
      loadSale();
    }
  }, [id]);

  const loadProducts = async () => {
    try {
      // Backend limit max 100, so we fetch in batches
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await productsService.getProducts({ page, limit: 100 });
        allProducts = [...allProducts, ...response.data];
        hasMore = response.data.length === 100 && page * 100 < response.total;
        page++;
      }
      
      const activeProducts = allProducts.filter((p) => p.isActive);
      setProducts(activeProducts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadSale = async () => {
    if (!id) return;

    try {
      setLoadingSale(true);
      const sale = await salesService.getSale(id);
      
      // Convert sale items to form format
      const formItems: SaleItemForm[] = sale.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
      }));

      setItems(formItems);
      setPaymentMethod(sale.paymentMethod);
      setTotalDiscount(sale.discountAmount);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load sale',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/sales');
    } finally {
      setLoadingSale(false);
    }
  };

  const addItem = () => {
    if (!selectedProductId) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Check if product already added
    if (items.find((item) => item.productId === selectedProductId)) {
      toast({
        title: 'Info',
        description: 'Product already added. Update quantity instead.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newItem: SaleItemForm = {
      productId: selectedProductId,
      quantity: 1,
      unitPrice: product.unitPrice,
      discountAmount: 0,
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItemForm, value: number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateLineTotal = (item: SaleItemForm): number => {
    return item.quantity * item.unitPrice - item.discountAmount;
  };

  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() - totalDiscount;
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (calculateTotal() <= 0) {
      toast({
        title: 'Error',
        description: 'Total amount must be greater than zero',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!id) return;

    setLoading(true);
    try {
      const saleData: UpdateSaleRequest = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
        })),
        paymentMethod,
        discountAmount: totalDiscount > 0 ? totalDiscount : undefined,
      };

      await salesService.updateSale(id, saleData);
      toast({
        title: 'Success',
        description: 'Sale updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/sales');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update sale',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string): string => {
    return products.find((p) => p.id === productId)?.name || 'Unknown';
  };

  if (loadingSale) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text>Loading sale...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex direction="column" gap="20px">
        {/* Header */}
        <Heading color={textColor} fontSize="2xl" fontWeight="700">
          Edit Sale
        </Heading>

        <Flex direction={{ base: 'column', lg: 'row' }} gap="20px">
          {/* Left Column - Product Selection and Items */}
          <Box flex="2">
            <Card p="30px">
              <Flex direction="column" gap="20px">
                {/* Add Product */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                    Add Product
                  </FormLabel>
                  <HStack>
                    <Select
                      placeholder="Select product"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      flex="1"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₺{product.unitPrice.toFixed(2)} (Stock: {product.stockQuantity})
                        </option>
                      ))}
                    </Select>
                    <Button
                      leftIcon={<MdAdd />}
                      colorScheme="brand"
                      onClick={addItem}
                      isDisabled={!selectedProductId}
                    >
                      Add
                    </Button>
                  </HStack>
                </FormControl>

                {/* Items Table */}
                {items.length > 0 && (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Product</Th>
                          <Th isNumeric>Quantity</Th>
                          <Th isNumeric>Unit Price</Th>
                          <Th isNumeric>Discount</Th>
                          <Th isNumeric>Total</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {items.map((item, index) => (
                          <Tr key={index}>
                            <Td>
                              <Text fontWeight="600">{getProductName(item.productId)}</Text>
                            </Td>
                            <Td isNumeric>
                              <HStack spacing="5px">
                                <IconButton
                                  aria-label="Decrease quantity"
                                  icon={<MdRemove />}
                                  size="xs"
                                  onClick={() => {
                                    const newQuantity = Math.max(0.01, item.quantity - 1);
                                    updateItem(index, 'quantity', newQuantity);
                                  }}
                                />
                                <NumberInput
                                  size="sm"
                                  value={item.quantity}
                                  min={0.01}
                                  step={0.01}
                                  onChange={(_, value) => updateItem(index, 'quantity', isNaN(value) ? 0.01 : value)}
                                  w="80px"
                                >
                                  <NumberInputField textAlign="center" />
                                </NumberInput>
                                <IconButton
                                  aria-label="Increase quantity"
                                  icon={<MdAdd />}
                                  size="xs"
                                  onClick={() => {
                                    const newQuantity = item.quantity + 1;
                                    updateItem(index, 'quantity', newQuantity);
                                  }}
                                />
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              <NumberInput
                                size="sm"
                                value={item.unitPrice}
                                min={0}
                                step={0.01}
                                onChange={(_, value) => updateItem(index, 'unitPrice', isNaN(value) ? 0 : value)}
                                w="120px"
                              >
                                <NumberInputField />
                              </NumberInput>
                            </Td>
                            <Td isNumeric>
                              <NumberInput
                                size="sm"
                                value={item.discountAmount}
                                min={0}
                                step={0.01}
                                onChange={(_, value) => updateItem(index, 'discountAmount', isNaN(value) ? 0 : value)}
                                w="100px"
                              >
                                <NumberInputField />
                              </NumberInput>
                            </Td>
                            <Td isNumeric>
                              <Text fontWeight="600">₺{calculateLineTotal(item).toFixed(2)}</Text>
                            </Td>
                            <Td>
                              <IconButton
                                aria-label="Remove item"
                                icon={<MdDelete />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeItem(index)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                {items.length === 0 && (
                  <Box textAlign="center" py="40px">
                    <MdShoppingCart size="48px" color="gray" />
                    <Text mt="10px" color={textColor}>
                      No items added. Select a product and click Add.
                    </Text>
                  </Box>
                )}
              </Flex>
            </Card>
          </Box>

          {/* Right Column - Summary */}
          <Box flex="1">
            <Card p="30px">
              <Flex direction="column" gap="20px">
                <Heading size="md" color={textColor}>
                  Sale Summary
                </Heading>

                {/* Subtotal */}
                <Flex justify="space-between">
                  <Text color={textColor}>Subtotal:</Text>
                  <Text fontWeight="600" color={textColor}>
                    ₺{calculateSubtotal().toFixed(2)}
                  </Text>
                </Flex>

                {/* Total Discount */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                    Total Discount
                  </FormLabel>
                  <NumberInput
                    value={totalDiscount}
                    min={0}
                    step={0.01}
                    onChange={(_, value) => setTotalDiscount(isNaN(value) ? 0 : value)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                {/* Total */}
                <Flex justify="space-between" pt="10px" borderTop="1px solid" borderColor="gray.200">
                  <Text fontSize="lg" fontWeight="700" color={textColor}>
                    Total:
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color={brandStars}>
                    ₺{calculateTotal().toFixed(2)}
                  </Text>
                </Flex>

                {/* Payment Method */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                    Payment Method
                  </FormLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.CARD}>Card</option>
                    <option value={PaymentMethod.MIXED}>Mixed</option>
                  </Select>
                </FormControl>

                {/* Actions */}
                <Flex gap="10px" direction="column" mt="10px">
                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={loading}
                    loadingText="Updating..."
                    isDisabled={items.length === 0 || calculateTotal() <= 0}
                    leftIcon={<MdShoppingCart />}
                  >
                    Update Sale
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/sales')}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default EditSalePage;

