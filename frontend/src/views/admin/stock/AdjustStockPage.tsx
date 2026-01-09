import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Textarea,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card } from 'components/local-grocery';
import stockService from 'services/stock.service';
import productsService from 'services/products.service';
import { Product } from 'types/products';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

interface AdjustStockFormData {
  newQuantity: number;
  notes?: string;
}

const adjustStockSchema = yup.object<AdjustStockFormData>().shape({
  newQuantity: yup
    .number()
    .min(0, 'Stock quantity cannot be negative')
    .required('New quantity is required'),
  notes: yup.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

const AdjustStockPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const boxBg = useColorModeValue('gray.50', 'gray.700');

  const isTenantAdmin = authContext?.user?.roles.includes('TenantAdmin') || false;

  useEffect(() => {
    if (!isTenantAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only TenantAdmin can adjust stock',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/products');
      return;
    }
    if (productId) {
      loadProduct(productId);
    } else {
      navigate('/admin/products');
    }
  }, [productId, isTenantAdmin]);

  const loadProduct = async (prodId: string) => {
    try {
      setLoadingProduct(true);
      const data = await productsService.getProduct(prodId);
      setProduct(data);
      setValue('newQuantity', data.stockQuantity);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/products');
    } finally {
      setLoadingProduct(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(adjustStockSchema),
  });

  const newQuantity = watch('newQuantity');
  const currentQuantity = product?.stockQuantity || 0;
  const adjustment = newQuantity - currentQuantity;

  const onSubmit = async (data: any) => {
    if (!productId) return;

    try {
      setLoading(true);
      await stockService.adjustStock(productId, data.newQuantity, data.notes);
      toast({
        title: 'Success',
        description: 'Stock adjusted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to adjust stock',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isTenantAdmin) {
    return null;
  }

  if (loadingProduct) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text>Loading product...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading size="lg" color={textColor} mb="20px">
        Adjust Stock - {product?.name}
      </Heading>

      <Card p="30px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="20px">
            <Alert status="info">
              <AlertIcon />
              Current stock quantity: <strong>{currentQuantity}</strong>
            </Alert>

            <FormControl isInvalid={!!errors.newQuantity}>
              <FormLabel>
                New Quantity<Text color={brandStars}>*</Text>
              </FormLabel>
              <NumberInput
                min={0}
                precision={2}
                value={newQuantity || 0}
                onChange={(_, value) => setValue('newQuantity', isNaN(value) ? 0 : value)}
              >
                <NumberInputField />
              </NumberInput>
              <FormErrorMessage>{errors.newQuantity?.message}</FormErrorMessage>
            </FormControl>

            <Box
              p="15px"
              bg={boxBg}
              borderRadius="md"
            >
              <Text fontSize="sm" fontWeight="600" mb="5px">
                Adjustment Summary:
              </Text>
              <Text fontSize="sm">
                Current: <strong>{currentQuantity}</strong>
              </Text>
              <Text fontSize="sm">
                New: <strong>{newQuantity || 0}</strong>
              </Text>
              <Text
                fontSize="sm"
                fontWeight="600"
                color={adjustment >= 0 ? 'green.500' : 'red.500'}
              >
                Difference: {adjustment >= 0 ? '+' : ''}
                {adjustment.toFixed(2)}
              </Text>
            </Box>

            <FormControl isInvalid={!!errors.notes}>
              <FormLabel>Notes (Optional)</FormLabel>
              <Textarea
                {...register('notes')}
                placeholder="Reason for stock adjustment (e.g., Inventory count, Damage, etc.)"
                rows={3}
              />
              <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
            </FormControl>

            <Flex gap="10px" justify="flex-end" mt="20px">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/products')}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={loading}>
                Adjust Stock
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};

export default AdjustStockPage;
