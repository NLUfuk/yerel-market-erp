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
  Switch,
  IconButton,
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
import { DataTable, SearchInput, Pagination } from 'components/local-grocery';
import { Product, Category } from 'types/products';
import productsService from 'services/products.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  
  // Safe role check
  const hasRole = (role: string): boolean => {
    if (!authContext?.user) return false;
    return authContext.user.roles.includes(role);
  };
  const canEdit = hasRole('TenantAdmin') || hasRole('SuperAdmin');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, limit, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await productsService.getProducts(params);
      let filteredProducts = response.data;

      // Filter by category if selected
      if (selectedCategory) {
        filteredProducts = filteredProducts.filter(
          (p) => p.categoryId === selectedCategory
        );
      }

      setProducts(filteredProducts);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await productsService.getCategories();
      setCategories(data);
    } catch (error) {
      // Categories loading error is not critical
      console.error('Failed to load categories:', error);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await productsService.deleteProduct(productToDelete.id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setProductToDelete(null);
      onClose();
      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productsService.updateProduct(product.id, {
        isActive: !product.isActive,
      });
      toast({
        title: 'Success',
        description: `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toFixed(2)}`;
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getStockStatus = (stock: number, minLevel: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'red' };
    if (stock <= minLevel) return { label: 'Low Stock', color: 'orange' };
    return { label: 'In Stock', color: 'green' };
  };

  const columns = [
    {
      header: 'Name',
      accessor: (product: Product) => (
        <Box>
          <Heading size="sm" color={textColor}>
            {product.name}
          </Heading>
          <Box fontSize="xs" color="gray.500">
            SKU: {product.sku}
          </Box>
        </Box>
      ),
    },
    {
      header: 'Category',
      accessor: (product: Product) => getCategoryName(product.categoryId),
    },
    {
      header: 'Price',
      accessor: (product: Product) => formatPrice(product.unitPrice),
      isNumeric: true,
    },
    {
      header: 'Stock',
      accessor: (product: Product) => {
        const status = getStockStatus(product.stockQuantity, product.minStockLevel);
        return (
          <HStack spacing={2}>
            <Text>{product.stockQuantity}</Text>
            <Badge colorScheme={status.color}>{status.label}</Badge>
            {canEdit && (
              <Button
                size="xs"
                colorScheme="orange"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/stock/adjust/${product.id}`);
                }}
              >
                Adjust
              </Button>
            )}
          </HStack>
        );
      },
      isNumeric: false,
    },
    {
      header: 'Status',
      accessor: (product: Product) => (
        <HStack spacing={3}>
          <Switch
            isChecked={product.isActive}
            onChange={() => handleToggleActive(product)}
            colorScheme="green"
            isDisabled={!canEdit}
            size="md"
          />
          <Badge colorScheme={product.isActive ? 'green' : 'gray'} fontSize="xs">
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </HStack>
      ),
    },
    {
      header: 'Actions',
      accessor: (product: Product) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit product"
            icon={<MdEdit />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${product.id}`);
            }}
            isDisabled={!canEdit}
          />
          <IconButton
            aria-label="Delete product"
            icon={<MdDelete />}
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(product);
            }}
            isDisabled={!canEdit}
          />
        </HStack>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="20px">
        <Heading size="lg" color={textColor}>
          Products
        </Heading>
        {canEdit && (
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={() => navigate('/admin/products/new')}
          >
            New Product
          </Button>
        )}
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap="20px" mb="20px">
        <Box flex="1">
          <SearchInput
            placeholder="Search products by name or SKU..."
            onSearch={setSearchTerm}
            debounceMs={500}
          />
        </Box>
        <Box w={{ base: '100%', md: '200px' }}>
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found"
      />

      {totalPages > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Product
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? The
              product will be deactivated and hidden from new sales, but existing sales history
              will be preserved.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ProductsListPage;

