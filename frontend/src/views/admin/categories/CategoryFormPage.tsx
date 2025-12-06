import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorModeValue,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Card from 'components/local-grocery/Card';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from 'types/products';
import productsService from 'services/products.service';

const categorySchema = yup.object({
  name: yup
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(255, 'Category name must be less than 255 characters')
    .required('Category name is required'),
  description: yup
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),
});

type CategoryFormData = {
  name: string;
  description?: string | null;
};

const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadCategory();
    }
  }, [id, isEdit]);

  const loadCategory = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const categories = await productsService.getCategories();
      const foundCategory = categories.find((c) => c.id === id);
      
      if (foundCategory) {
        setCategory(foundCategory);
        setValue('name', foundCategory.name);
        setValue('description', foundCategory.description || '');
      } else {
        toast({
          title: 'Error',
          description: 'Category not found',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/admin/categories');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const categoryData: CreateCategoryRequest = {
        name: data.name,
        description: data.description || undefined,
      };

      if (isEdit && id) {
        await productsService.updateCategory(id, categoryData);
        toast({
          title: 'Success',
          description: 'Category updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await productsService.createCategory(categoryData);
        toast({
          title: 'Success',
          description: 'Category created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      navigate('/admin/categories');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
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
      <Flex direction="column" gap="20px">
        {/* Header */}
        <Heading color={textColor} fontSize="2xl" fontWeight="700">
          {isEdit ? 'Edit Category' : 'Create Category'}
        </Heading>

        {/* Form */}
        <Card p="30px">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="20px">
              {/* Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Category Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  {...register('name')}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: '0px', md: '0px' }}
                  type="text"
                  placeholder="e.g., Dairy, Beverages, Snacks"
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                />
                {errors.name && (
                  <Text color="red.500" fontSize="xs" mb="8px" mt="-16px">
                    {errors.name.message}
                  </Text>
                )}
              </FormControl>

              {/* Description */}
              <FormControl isInvalid={!!errors.description}>
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  display="flex"
                >
                  Description
                </FormLabel>
                <Textarea
                  {...register('description')}
                  fontSize="sm"
                  placeholder="Optional description for this category"
                  mb="24px"
                  size="lg"
                  rows={4}
                />
                {errors.description && (
                  <Text color="red.500" fontSize="xs" mb="8px" mt="-16px">
                    {errors.description.message}
                  </Text>
                )}
              </FormControl>

              {/* Actions */}
              <Flex gap="10px" justify="flex-end" mt="10px">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/categories')}
                  isDisabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={loading}
                  loadingText={isEdit ? 'Updating...' : 'Creating...'}
                >
                  {isEdit ? 'Update Category' : 'Create Category'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Flex>
    </Box>
  );
};

export default CategoryFormPage;

