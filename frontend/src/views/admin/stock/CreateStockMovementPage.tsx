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
  Textarea,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card } from 'components/local-grocery';
import { CreateStockMovementRequest, StockMovementType } from 'types/stock';
import stockService from 'services/stock.service';
import productsService from 'services/products.service';
import { Product } from 'types/products';

interface StockMovementFormData {
  productId: string;
  movementType: StockMovementType;
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  notes?: string;
}

const stockMovementSchema = yup.object<StockMovementFormData>().shape({
  productId: yup.string().required('Product is required'),
  movementType: yup
    .string()
    .oneOf(Object.values(StockMovementType))
    .required('Movement type is required'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .notOneOf([0], 'Quantity cannot be zero'),
  unitPrice: yup
    .number()
    .min(0, 'Unit price cannot be negative')
    .required('Unit price is required'),
  referenceId: yup.string().uuid('Reference ID must be a valid UUID').optional(),
  notes: yup.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

const CreateStockMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(stockMovementSchema),
  });

  const movementType = watch('movementType');
  const productId = watch('productId');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await productsService.getProducts({ page, limit: 100 });
        allProducts = [...allProducts, ...response.data];
        hasMore = response.data.length === 100 && page * 100 < response.total;
        page++;
      }

      setProducts(allProducts.filter((p) => p.isActive));
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

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Adjust quantity sign based on movement type
      let quantity = data.quantity;
      if (movementType === StockMovementType.SALE) {
        quantity = -Math.abs(quantity); // Sale should be negative
      } else if (movementType === StockMovementType.PURCHASE) {
        quantity = Math.abs(quantity); // Purchase should be positive
      } else {
        // ADJUSTMENT and RETURN can be positive or negative
        quantity = data.quantity;
      }

      const movementData: CreateStockMovementRequest = {
        productId: data.productId,
        movementType: data.movementType,
        quantity,
        unitPrice: data.unitPrice,
        referenceId: data.referenceId || undefined,
        notes: data.notes || undefined,
      };

      await stockService.createStockMovement(movementData);
      toast({
        title: 'Success',
        description: 'Stock movement created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/stock/movements');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create stock movement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find((p) => p.id === productId);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading size="lg" color={textColor} mb="20px">
        New Stock Movement
      </Heading>

      <Card p="30px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="20px">
            <FormControl isInvalid={!!errors.productId}>
              <FormLabel>
                Product<Text color={brandStars}>*</Text>
              </FormLabel>
              <Select
                {...register('productId')}
                placeholder="Select product"
                value={productId}
                onChange={(e) => setValue('productId', e.target.value)}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Stock: {product.stockQuantity}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.productId?.message}</FormErrorMessage>
              {getSelectedProduct() && (
                <Text fontSize="sm" color="gray.500" mt="5px">
                  Current stock: {getSelectedProduct()?.stockQuantity}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.movementType}>
              <FormLabel>
                Movement Type<Text color={brandStars}>*</Text>
              </FormLabel>
              <Select
                {...register('movementType')}
                value={movementType}
                onChange={(e) => setValue('movementType', e.target.value as StockMovementType)}
              >
                <option value={StockMovementType.PURCHASE}>Purchase (Increase)</option>
                <option value={StockMovementType.SALE}>Sale (Decrease)</option>
                <option value={StockMovementType.ADJUSTMENT}>Adjustment</option>
                <option value={StockMovementType.RETURN}>Return</option>
              </Select>
              <FormErrorMessage>{errors.movementType?.message}</FormErrorMessage>
            </FormControl>

            <Flex direction={{ base: 'column', md: 'row' }} gap="20px">
              <FormControl isInvalid={!!errors.quantity} flex="1">
                <FormLabel>
                  Quantity<Text color={brandStars}>*</Text>
                </FormLabel>
                <NumberInput
                  min={movementType === StockMovementType.ADJUSTMENT ? undefined : 0.01}
                  precision={2}
                  value={watch('quantity') || 0}
                  onChange={(_, value) => setValue('quantity', isNaN(value) ? 0 : value)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
                <Text fontSize="xs" color="gray.500" mt="5px">
                  {movementType === StockMovementType.SALE && 'Will be converted to negative'}
                  {movementType === StockMovementType.PURCHASE && 'Will be positive'}
                  {movementType === StockMovementType.ADJUSTMENT && 'Can be positive or negative'}
                </Text>
              </FormControl>

              <FormControl isInvalid={!!errors.unitPrice} flex="1">
                <FormLabel>
                  Unit Price (₺)<Text color={brandStars}>*</Text>
                </FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={watch('unitPrice') || 0}
                  onChange={(_, value) => setValue('unitPrice', isNaN(value) ? 0 : value)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{errors.unitPrice?.message}</FormErrorMessage>
                {getSelectedProduct() && (
                  <Text fontSize="xs" color="gray.500" mt="5px">
                    Product price: ₺{getSelectedProduct()?.unitPrice.toFixed(2)}
                  </Text>
                )}
              </FormControl>
            </Flex>

            <FormControl isInvalid={!!errors.referenceId}>
              <FormLabel>Reference ID (Optional)</FormLabel>
              <Input
                {...register('referenceId')}
                placeholder="UUID (e.g., Sale ID)"
              />
              <FormErrorMessage>{errors.referenceId?.message}</FormErrorMessage>
              <Text fontSize="xs" color="gray.500" mt="5px">
                Link this movement to a sale or purchase (UUID format)
              </Text>
            </FormControl>

            <FormControl isInvalid={!!errors.notes}>
              <FormLabel>Notes (Optional)</FormLabel>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes about this movement"
                rows={3}
              />
              <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
            </FormControl>

            <Flex gap="10px" justify="flex-end" mt="20px">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/stock/movements')}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={loading}>
                Create Movement
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};

export default CreateStockMovementPage;
