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
import { MdAdd, MdEdit, MdDelete, MdPerson, MdSwitchAccount } from 'react-icons/md';
import { DataTable, SearchInput, Pagination } from 'components/local-grocery';
import { User, Role } from 'types/users';
import usersService from 'services/users.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  // Safe role check
  const hasRole = (role: string): boolean => {
    if (!authContext?.user) return false;
    const userRoles = authContext.user.roles || [];
    return userRoles.includes(role);
  };
  // Backend already protects these endpoints, so we allow all authenticated users
  // Backend will return 403 if user doesn't have permission
  const canEdit = !!authContext?.user; // Allow all authenticated users, backend will enforce permissions
  const isSuperAdmin = hasRole('SuperAdmin');

  useEffect(() => {
    loadUsers();
  }, [page, limit, searchTerm, selectedRole, selectedTenant, isActiveFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (selectedRole) {
        params.role = selectedRole;
      }
      if (selectedTenant) {
        params.tenantId = selectedTenant;
      }
      if (isActiveFilter !== '') {
        params.isActive = isActiveFilter === 'true';
      }

      const response = await usersService.getUsers(params);
      setUsers(response.data);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      // Note: Backend'de user delete endpoint'i yok, bu yüzden isActive = false yapıyoruz
      await usersService.updateUser(userToDelete.id, { isActive: false });
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    console.log('handleToggleActive called for user:', user.id, 'current status:', user.isActive);
    try {
      await usersService.updateUser(user.id, {
        isActive: !user.isActive,
      });
      toast({
        title: 'Success',
        description: `User ${!user.isActive ? 'activated' : 'deactivated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadUsers();
    } catch (error: any) {
      console.error('Error toggling user active status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImpersonate = async (user: User) => {
    try {
      if (!authContext?.impersonate) {
        toast({
          title: 'Error',
          description: 'Impersonation not available',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      await authContext.impersonate(user.id);
      toast({
        title: 'Success',
        description: `Now impersonating ${user.firstName} ${user.lastName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Reload page to reflect new user context
      window.location.href = '/admin/dashboard';
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to impersonate user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getRoleBadges = (roles: string[] | Role[]) => {
    if (!roles || roles.length === 0) {
      return <Badge colorScheme="gray">No Role</Badge>;
    }
    
    // Handle both string[] (from backend) and Role[] (for compatibility)
    const roleNames = roles.map((role) => 
      typeof role === 'string' ? role : role.name || role
    );
    
    return (
      <HStack spacing={1}>
        {roleNames.map((roleName, index) => (
          <Badge
            key={index}
            colorScheme={
              roleName === 'SuperAdmin'
                ? 'purple'
                : roleName === 'TenantAdmin'
                ? 'blue'
                : roleName === 'Cashier'
                ? 'green'
                : 'gray'
            }
          >
            {roleName}
          </Badge>
        ))}
      </HStack>
    );
  };

  const columns = [
    {
      header: 'User',
      accessor: (user: User) => (
        <Box>
          <Heading size="sm" color={textColor}>
            {user.firstName} {user.lastName}
          </Heading>
          <Box fontSize="xs" color="gray.500">
            {user.email}
          </Box>
        </Box>
      ),
    },
    {
      header: 'Roles',
      accessor: (user: User) => getRoleBadges(user.roles),
    },
    ...(isSuperAdmin
      ? [
          {
            header: 'Tenant',
            accessor: (user: User) => (
              <Text fontSize="sm">
                {user.tenant?.name || (user.tenantId ? 'Unknown' : 'SuperAdmin')}
              </Text>
            ),
          },
        ]
      : []),
    {
      header: 'Status',
      accessor: (user: User) => (
        <Box 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }} 
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <HStack spacing={3}>
            <Switch
              isChecked={user.isActive}
              onChange={(checked) => {
                console.log('Switch onChange triggered, checked:', checked, 'user:', user.id);
                handleToggleActive(user);
              }}
              onClick={(e) => {
                console.log('Switch onClick triggered');
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseDown={(e) => {
                console.log('Switch onMouseDown triggered');
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={(e) => {
                console.log('Switch onMouseUp triggered');
                e.stopPropagation();
                e.preventDefault();
              }}
              colorScheme="green"
              size="md"
            />
            <Badge colorScheme={user.isActive ? 'green' : 'gray'} fontSize="xs">
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>
        </Box>
      ),
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <Box 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }} 
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <HStack spacing={2}>
            {isSuperAdmin && (
              <IconButton
                aria-label="Impersonate user"
                icon={<MdSwitchAccount />}
                size="sm"
                variant="outline"
                colorScheme="purple"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleImpersonate(user);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                isDisabled={user.id === authContext?.user?.id || !user.isActive}
                title="Impersonate this user"
              />
            )}
            <IconButton
              aria-label="Edit user"
              icon={<MdEdit />}
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={(e) => {
                console.log('Edit button clicked for user:', user.id);
                e.stopPropagation();
                e.preventDefault();
                navigate(`/admin/users/${user.id}`);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            />
            <IconButton
              aria-label="Delete user"
              icon={<MdDelete />}
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={(e) => {
                console.log('Delete button clicked for user:', user.id);
                e.stopPropagation();
                e.preventDefault();
                handleDeleteClick(user);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              isDisabled={user.id === authContext?.user?.id}
            />
          </HStack>
        </Box>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex justify="space-between" align="center" mb="20px">
        <Heading size="lg" color={textColor}>
          Users
        </Heading>
        {canEdit && (
          <Button
            leftIcon={<MdAdd />}
            colorScheme="brand"
            onClick={() => navigate('/admin/users/new')}
          >
            New User
          </Button>
        )}
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap="20px" mb="20px" wrap="wrap">
        <Box flex="1" minW="200px">
          <SearchInput
            placeholder="Search users by name or email..."
            onSearch={setSearchTerm}
            debounceMs={500}
          />
        </Box>
        <Box w={{ base: '100%', md: '150px' }}>
          <Select
            placeholder="All Roles"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="TenantAdmin">TenantAdmin</option>
            <option value="Cashier">Cashier</option>
            <option value="Viewer">Viewer</option>
          </Select>
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
        data={users}
        loading={loading}
        emptyMessage="No users found"
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
              Deactivate User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to deactivate{' '}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>
              ? This will prevent them from logging in.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UsersListPage;
