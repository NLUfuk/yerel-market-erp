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
import { Tenant } from 'types/tenants';
import tenantsService from 'services/tenants.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const TenantsListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  const isSuperAdmin = authContext?.user?.roles.includes('SuperAdmin') || false;

  useEffect(() => {
    if (!isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only SuperAdmin can access tenant management',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/dashboard');
      return;
    }
    loadTenants();
  }, [page, limit, searchTerm, isActiveFilter]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (isActiveFilter !== '') {
        params.isActive = isActiveFilter === 'true';
      }

      const response = await tenantsService.getTenants(params);
      setTenants(response.data);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load tenants',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      await tenantsService.deleteTenant(tenantToDelete.id);
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setTenantToDelete(null);
      loadTenants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete tenant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleActive = async (tenant: Tenant) => {
    try {
      await tenantsService.updateTenant(tenant.id, {
        isActive: !tenant.isActive,
      });
      toast({
        title: 'Success',
        description: `Tenant ${!tenant.isActive ? 'activated' : 'deactivated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadTenants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update tenant status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  const columns = [
    {
      header: 'Name',
      accessor: (tenant: Tenant) => (
        <Box>
          <Heading size="sm" color={textColor}>
            {tenant.name}
          </Heading>
          {tenant.email && (
            <Box fontSize="xs" color="gray.500">
              {tenant.email}
            </Box>
          )}
        </Box>
      ),
    },
    {
      header: 'Address',
      accessor: (tenant: Tenant) => (
        <Text fontSize="sm" noOfLines={2}>
          {tenant.address || '-'}
        </Text>
      ),
    },
    {
      header: 'Phone',
      accessor: (tenant: Tenant) => (
        <Text fontSize="sm">{tenant.phone || '-'}</Text>
      ),
    },
    {
      header: 'Status',
      accessor: (tenant: Tenant) => (
        <HStack spacing={3}>
          <Switch
            isChecked={tenant.isActive}
            onChange={() => handleToggleActive(tenant)}
            colorScheme="green"
            size="md"
          />
          <Badge colorScheme={tenant.isActive ? 'green' : 'gray'} fontSize="xs">
            {tenant.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </HStack>
      ),
    },
    {
      header: 'Actions',
      accessor: (tenant: Tenant) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit tenant"
            icon={<MdEdit />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/tenants/${tenant.id}`);
            }}
          />
          <IconButton
            aria-label="Delete tenant"
            icon={<MdDelete />}
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(tenant);
            }}
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
          Tenants
        </Heading>
        <Button
          leftIcon={<MdAdd />}
          colorScheme="brand"
          onClick={() => navigate('/admin/tenants/new')}
        >
          New Tenant
        </Button>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap="20px" mb="20px" wrap="wrap">
        <Box flex="1" minW="200px">
          <SearchInput
            placeholder="Search tenants by name, email, or phone..."
            onSearch={setSearchTerm}
            debounceMs={500}
          />
        </Box>
        <Box w={{ base: '100%', md: '150px' }}>
          <Select
            placeholder="All Status"
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </Box>
      </Flex>

      <DataTable
        columns={columns}
        data={tenants}
        loading={loading}
        emptyMessage="No tenants found"
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
              Delete Tenant
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <strong>{tenantToDelete?.name}</strong>? This
              will permanently delete all associated data including users, products, and sales.
              This action cannot be undone.
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

export default TenantsListPage;
