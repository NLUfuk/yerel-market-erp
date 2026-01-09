import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Text,
  Divider,
  Badge,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdDelete } from 'react-icons/md';
import { Card } from 'components/local-grocery';
import { User, CreateUserRequest, UpdateUserRequest } from 'types/users';
import usersService from 'services/users.service';
import tenantsService from 'services/tenants.service';
import { Tenant } from 'types/tenants';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  isActive: boolean;
}

const userSchema = yup.object<UserFormData>().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .when('$isEdit', {
      is: false,
      then: (schema) => schema.required('Password is required'),
      otherwise: (schema) => schema.optional(),
    }),
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters')
    .required('Last name is required'),
  tenantId: yup.string().nullable(),
  isActive: yup.boolean().optional(),
});

const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const isSuperAdmin = authContext?.user?.roles.includes('SuperAdmin') || false;
  const currentUserTenantId = authContext?.user?.tenantId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEdit },
    defaultValues: {
      isActive: true,
      tenantId: currentUserTenantId || null,
    },
  });

  const isActive = watch('isActive');
  const tenantId = watch('tenantId');

  useEffect(() => {
    if (isSuperAdmin) {
      loadTenants();
    }
    if (isEdit && id) {
      loadUser(id);
    }
  }, [id, isEdit, isSuperAdmin]);

  const loadUser = async (userId: string) => {
    try {
      setLoadingUser(true);
      // Note: Backend'de GET /users/:id endpoint'i olmayabilir, kontrol et
      const data = await usersService.getUser(userId);
      setUser(data);
      setValue('email', data.email);
      setValue('firstName', data.firstName);
      setValue('lastName', data.lastName);
      setValue('tenantId', data.tenantId || null);
      setValue('isActive', data.isActive);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/users');
    } finally {
      setLoadingUser(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await tenantsService.getTenants({ limit: 100 });
      setTenants(response.data);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        const updateData: UpdateUserRequest = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          isActive: data.isActive,
          // Note: tenantId is not included because backend UpdateUserDto doesn't support it
          // Tenant changes should be handled through a separate endpoint if needed
        };
        // Only update password if provided
        if (data.password && data.password.length > 0) {
          updateData.password = data.password;
        }
        await usersService.updateUser(id, updateData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const createData: CreateUserRequest = {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          tenantId: data.tenantId || currentUserTenantId || null,
          isActive: data.isActive ?? true,
        };
        await usersService.createUser(createData);
        toast({
          title: 'Success',
          description: 'User created successfully. You can assign roles from the user list.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      navigate('/admin/users');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text>Loading user...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading size="lg" color={textColor} mb="20px">
        {isEdit ? 'Edit User' : 'New User'}
      </Heading>

      <Card p="30px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="20px">
            {/* Basic Information */}
            <Flex direction={{ base: 'column', md: 'row' }} gap="20px">
              <FormControl isInvalid={!!errors.firstName} flex="1">
                <FormLabel>
                  First Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input {...register('firstName')} placeholder="e.g., John" />
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.lastName} flex="1">
                <FormLabel>
                  Last Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input {...register('lastName')} placeholder="e.g., Doe" />
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                type="email"
                {...register('email')}
                placeholder="e.g., user@example.com"
                isDisabled={isEdit}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>
                Password<Text color={brandStars}>{!isEdit && '*'}</Text>
              </FormLabel>
              <Input
                type="password"
                {...register('password')}
                placeholder={isEdit ? 'Leave empty to keep current password' : 'Minimum 6 characters'}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              {isEdit && (
                <Text fontSize="xs" color="gray.500" mt="5px">
                  Leave empty to keep current password
                </Text>
              )}
            </FormControl>

            {isSuperAdmin && (
              <FormControl>
                <FormLabel>Tenant</FormLabel>
                <Select
                  {...register('tenantId')}
                  value={tenantId || ''}
                  onChange={(e) => setValue('tenantId', e.target.value || null)}
                  placeholder="Select tenant (or leave empty for SuperAdmin)"
                >
                  <option value="">None (SuperAdmin)</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

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

            {isEdit && user && (
              <>
                <Divider />
                <Box>
                  <FormLabel mb="10px">Current Roles</FormLabel>
                  {user.roles && user.roles.length > 0 ? (
                    <HStack spacing={2} flexWrap="wrap">
                      {user.roles.map((role, index) => (
                        <Badge
                          key={index}
                          colorScheme={
                            role.name === 'SuperAdmin'
                              ? 'purple'
                              : role.name === 'TenantAdmin'
                              ? 'blue'
                              : role.name === 'Cashier'
                              ? 'green'
                              : 'gray'
                          }
                          fontSize="sm"
                          p="5px 10px"
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No roles assigned
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.500" mt="5px">
                    To manage roles, go to the user list and use the role assignment feature
                  </Text>
                </Box>
              </>
            )}

            {/* Actions */}
            <Flex gap="10px" justify="flex-end" mt="20px">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={loading}>
                {isEdit ? 'Update' : 'Create'} User
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};

export default UserFormPage;
