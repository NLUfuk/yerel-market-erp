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
  Switch,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card } from 'components/local-grocery';
import { Product, Category, CreateProductRequest } from 'types/products';
import productsService from 'services/products.service';

interface ProductFormData {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  unitPrice: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  isActive?: boolean;
}

const productSchema = yup.object<ProductFormData>().shape({
  name: yup
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name must be less than 255 characters')
    .required('Product name is required'),
  sku: yup
    .string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters')
    .required('SKU is required'),
  barcode: yup.string().max(100, 'Barcode must be less than 100 characters').nullable().optional(),
  categoryId: yup.string().required('Category is required'),
  unitPrice: yup
    .number()
    .min(0, 'Unit price cannot be negative')
    .required('Unit price is required'),
  costPrice: yup.number().min(0, 'Cost price cannot be negative').nullable().optional(),
  stockQuantity: yup
    .number()
    .min(0, 'Stock quantity cannot be negative')
    .required('Stock quantity is required'),
  minStockLevel: yup.number().min(0, 'Min stock level cannot be negative').nullable().optional(),
  isActive: yup.boolean().optional(),
});

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      isActive: true,
      stockQuantity: 0,
      minStockLevel: 0,
    },
  });

  const isActive = watch('isActive');

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const data = await productsService.getProduct(productId);
      setProduct(data);
      // Set form values
      setValue('name', data.name);
      setValue('sku', data.sku);
      setValue('barcode', data.barcode || '');
      setValue('categoryId', data.categoryId);
      setValue('unitPrice', data.unitPrice);
      setValue('costPrice', data.costPrice || 0);
      setValue('stockQuantity', data.stockQuantity);
      setValue('minStockLevel', data.minStockLevel);
      setValue('isActive', data.isActive);
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
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await productsService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const productData: CreateProductRequest = {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || undefined,
        categoryId: data.categoryId,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice || undefined,
        stockQuantity: data.stockQuantity,
        minStockLevel: data.minStockLevel,
        isActive: data.isActive ?? true,
      };

      if (isEdit && id) {
        await productsService.updateProduct(id, productData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await productsService.createProduct(productData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      navigate('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading size="lg" color={textColor} mb="20px">
        {isEdit ? 'Edit Product' : 'New Product'}
      </Heading>

      <Card p="30px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="20px">
            {/* Basic Information */}
            <Flex direction={{ base: 'column', md: 'row' }} gap="20px">
              <FormControl isInvalid={!!errors.name} flex="1">
                <FormLabel>
                  Product Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input {...register('name')} placeholder="e.g., Milk" />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.sku} flex="1">
                <FormLabel>
                  SKU<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input {...register('sku')} placeholder="e.g., MLK-01" />
                <FormErrorMessage>{errors.sku?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            <Flex direction={{ base: 'column', md: 'row' }} gap="20px">
              <FormControl isInvalid={!!errors.barcode} flex="1">
                <FormLabel>Barcode</FormLabel>
                <Input {...register('barcode')} placeholder="e.g., 8690123456789" />
                <FormErrorMessage>{errors.barcode?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.categoryId} flex="1">
                <FormLabel>
                  Category<Text color={brandStars}>*</Text>
                </FormLabel>
                <Select {...register('categoryId')} placeholder="Select category">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.categoryId?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            {/* Pricing */}
            <Flex direction={{ base: 'column', md: 'row' }} gap="20px">
              <FormControl isInvalid={!!errors.unitPrice} flex="1">
                <FormLabel>
                  Unit Price (₺)<Text color={brandStars}>*</Text>
                </FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={watch('unitPrice') || 0}
                  onChange={(_, value) => setValue('unitPrice', value)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{errors.unitPrice?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.costPrice} flex="1">
                <FormLabel>Cost Price (₺)</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={watch('costPrice') || 0}
                  onChange={(_, value) => setValue('costPrice', value)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{errors.costPrice?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            {/* Stock */}
            <Flex direction={{ base: 'column', md: 'row' }} gap="20px">
              <FormControl isInvalid={!!errors.stockQuantity} flex="1">
                <FormLabel>
                  Stock Quantity<Text color={brandStars}>*</Text>
                </FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={watch('stockQuantity') || 0}
                  onChange={(_, value) => setValue('stockQuantity', value)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{errors.stockQuantity?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.minStockLevel} flex="1">
                <FormLabel>Minimum Stock Level</FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={watch('minStockLevel') || 0}
                  onChange={(_, value) => setValue('minStockLevel', value)}
                >
                  <NumberInputField />
                </NumberInput>
                <FormErrorMessage>{errors.minStockLevel?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            {/* Status */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                Active
              </FormLabel>
              <Switch
                id="isActive"
                {...register('isActive')}
                isChecked={isActive}
                onChange={(e) => setValue('isActive', e.target.checked)}
              />
            </FormControl>

            {/* Actions */}
            <Flex gap="10px" justify="flex-end" mt="20px">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/products')}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={loading}>
                {isEdit ? 'Update' : 'Create'} Product
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};

export default ProductFormPage;

