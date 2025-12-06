import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  useToast,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { DataTable, SearchInput } from 'components/local-grocery';
import { Category } from 'types/products';
import productsService from 'services/products.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const CategoriesListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  
  // Safe role check
  const hasRole = (role: string): boolean => {
    if (!authContext?.user) return false;
    return authContext.user.roles.includes(role);
  };
  const canEdit = hasRole('TenantAdmin');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productsService.getCategories();
      setCategories(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load categories',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await productsService.deleteCategory(id);
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRowClick = (category: Category) => {
    if (canEdit) {
      navigate(`/admin/categories/${category.id}`);
    }
  };

  // Filter categories by search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      header: 'Name',
      accessor: (category: Category) => (
        <Text fontWeight="600" color={textColor}>
          {category.name}
        </Text>
      ),
    },
    {
      header: 'Description',
      accessor: (category: Category) => (
        <Text color={textColor} fontSize="sm">
          {category.description || '-'}
        </Text>
      ),
    },
    {
      header: 'Created',
      accessor: (category: Category) => (
        <Text color={textColor} fontSize="sm">
          {new Date(category.createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    ...(canEdit
      ? [
          {
            header: 'Actions',
            accessor: (category: Category) => (
              <Flex gap="2">
                <IconButton
                  aria-label="Edit category"
                  icon={<MdEdit />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/categories/${category.id}`);
                  }}
                />
                <IconButton
                  aria-label="Delete category"
                  icon={<MdDelete />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category.id);
                  }}
                />
              </Flex>
            ),
          },
        ]
      : []),
  ];

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex direction="column" gap="20px">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap">
          <Heading color={textColor} fontSize="2xl" fontWeight="700">
            Categories
          </Heading>
          {canEdit && (
            <Button
              leftIcon={<MdAdd />}
              colorScheme="brand"
              onClick={() => navigate('/admin/categories/new')}
            >
              Add Category
            </Button>
          )}
        </Flex>

        {/* Search and Filters */}
        <Flex gap="20px" wrap="wrap">
          <Box flex="1" minW="250px">
            <SearchInput
              placeholder="Search categories..."
              onSearch={setSearchTerm}
              debounceMs={300}
            />
          </Box>
        </Flex>

        {/* Categories Table */}
        <DataTable
          columns={columns}
          data={filteredCategories}
          loading={loading}
          emptyMessage="No categories found"
          onRowClick={canEdit ? handleRowClick : undefined}
        />
      </Flex>
    </Box>
  );
};

export default CategoriesListPage;

