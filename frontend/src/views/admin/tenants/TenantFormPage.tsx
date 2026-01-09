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
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from 'types/tenants';
import tenantsService from 'services/tenants.service';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

interface TenantFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

const tenantSchema = yup.object<TenantFormData>().shape({
  name: yup
    .string()
    .min(2, 'Tenant name must be at least 2 characters')
    .max(255, 'Tenant name must be less than 255 characters')
    .required('Tenant name is required'),
  address: yup.string().max(1000, 'Address must be less than 1000 characters').optional(),
  phone: yup.string().max(50, 'Phone must be less than 50 characters').optional(),
  email: yup.string().email('Invalid email address').optional(),
  isActive: yup.boolean().optional(),
});

const TenantFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const authContext = useContext(AuthContext);
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

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
    if (isEdit && id) {
      loadTenant(id);
    }
  }, [id, isEdit, isSuperAdmin]);

  const loadTenant = async (tenantId: string) => {
    try {
      setLoadingTenant(true);
      const data = await tenantsService.getTenant(tenantId);
      setTenant(data);
      setValue('name', data.name);
      setValue('address', data.address || '');
      setValue('phone', data.phone || '');
      setValue('email', data.email || '');
      setValue('isActive', data.isActive);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load tenant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/tenants');
    } finally {
      setLoadingTenant(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(tenantSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        const updateData: UpdateTenantRequest = {
          name: data.name,
          address: data.address || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          isActive: data.isActive,
        };
        await tenantsService.updateTenant(id, updateData);
        toast({
          title: 'Success',
          description: 'Tenant updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const createData: CreateTenantRequest = {
          name: data.name,
          address: data.address || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          isActive: data.isActive ?? true,
        };
        await tenantsService.createTenant(createData);
        toast({
          title: 'Success',
          description: 'Tenant created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      navigate('/admin/tenants');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save tenant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  if (loadingTenant) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text>Loading tenant...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading size="lg" color={textColor} mb="20px">
        {isEdit ? 'Edit Tenant' : 'New Tenant'}
      </Heading>

      <Card p="30px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="20px">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>
                Tenant Name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input {...register('name')} placeholder="e.g., My Local Market" />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                {...register('email')}
                placeholder="e.g., contact@mymarket.com"
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Phone</FormLabel>
              <Input {...register('phone')} placeholder="e.g., +90 555 123 4567" />
              <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.address}>
              <FormLabel>Address</FormLabel>
              <Textarea
                {...register('address')}
                placeholder="e.g., 123 Main Street, City, Country"
                rows={3}
              />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>

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

            <Flex gap="10px" justify="flex-end" mt="20px">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/tenants')}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={loading}>
                {isEdit ? 'Update' : 'Create'} Tenant
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};

export default TenantFormPage;
