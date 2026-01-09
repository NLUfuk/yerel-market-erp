import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
  Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { HSeparator } from 'components/separator/Separator';
import DefaultAuth from 'layouts/auth/Default';
import authService from 'services/auth.service';

interface RegisterTenantFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

// Validation schema
const schema = yup.object<RegisterTenantFormData>().shape({
  name: yup
    .string()
    .min(2, 'Tenant name must be at least 2 characters')
    .max(255, 'Tenant name must be less than 255 characters')
    .required('Tenant name is required'),
  address: yup.string().max(500, 'Address must be less than 500 characters').nullable().optional(),
  phone: yup.string().max(50, 'Phone must be less than 50 characters').nullable().optional(),
  email: yup.string().email('Invalid email address').nullable().optional(),
  adminEmail: yup.string().email('Invalid email').required('Admin email is required'),
  adminPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  adminFirstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters')
    .required('First name is required'),
  adminLastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters')
    .required('Last name is required'),
});

function RegisterTenant() {
  const navigate = useNavigate();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authService.registerTenant({
        tenantName: data.name,
        tenantAddress: data.address,
        tenantPhone: data.phone,
        tenantEmail: data.email,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
      });

      // Save auth data
      authService.saveAuthData(response);

      toast({
        title: 'Success',
        description: 'Tenant registered successfully! You are now logged in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect to dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'Registration failed. Please check your information and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => setShow(!show);

  return (
    <DefaultAuth>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Register Tenant
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Create a new market and admin account!
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
        >
          <Flex align="center" mb="25px">
            <HSeparator />
            <Text color="gray.400" mx="14px">
              Create Your Market
            </Text>
            <HSeparator />
          </Flex>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Tenant Information */}
            <Heading color={textColor} fontSize="20px" mb="20px" mt="10px">
              Market Information
            </Heading>

            <FormControl isInvalid={!!errors.name} mb="20px">
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Market Name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                {...register('name')}
                variant="auth"
                fontSize="sm"
                placeholder="My Local Market"
                fontWeight="500"
                size="lg"
              />
              {errors.name && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.name.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.address} mb="20px">
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Address
              </FormLabel>
              <Textarea
                {...register('address')}
                fontSize="sm"
                placeholder="123 Main Street, City"
                size="lg"
                rows={2}
              />
              {errors.address && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.address.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.phone} mb="20px">
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Phone
              </FormLabel>
              <Input
                {...register('phone')}
                variant="auth"
                fontSize="sm"
                placeholder="+90 555 123 4567"
                fontWeight="500"
                size="lg"
              />
              {errors.phone && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.phone.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.email} mb="24px">
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Market Email
              </FormLabel>
              <Input
                {...register('email')}
                variant="auth"
                fontSize="sm"
                type="email"
                placeholder="info@mymarket.com"
                fontWeight="500"
                size="lg"
              />
              {errors.email && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.email.message}
                </Text>
              )}
            </FormControl>

            {/* Admin User Information */}
            <Heading color={textColor} fontSize="20px" mb="20px" mt="10px">
              Admin Account
            </Heading>

            <FormControl isInvalid={!!errors.adminEmail} mb="20px">
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Admin Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                {...register('adminEmail')}
                variant="auth"
                fontSize="sm"
                type="email"
                placeholder="admin@mymarket.com"
                fontWeight="500"
                size="lg"
              />
              {errors.adminEmail && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.adminEmail.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.adminPassword} mb="20px">
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  {...register('adminPassword')}
                  fontSize="sm"
                  placeholder="Min. 6 characters"
                  size="lg"
                  type={show ? 'text' : 'password'}
                  variant="auth"
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.adminPassword && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.adminPassword.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.adminFirstName} mb="20px">
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                First Name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                {...register('adminFirstName')}
                variant="auth"
                fontSize="sm"
                placeholder="John"
                fontWeight="500"
                size="lg"
              />
              {errors.adminFirstName && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.adminFirstName.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.adminLastName} mb="24px">
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Last Name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                {...register('adminLastName')}
                variant="auth"
                fontSize="sm"
                placeholder="Doe"
                fontWeight="500"
                size="lg"
              />
              {errors.adminLastName && (
                <Text color="red.500" fontSize="xs" mt="4px">
                  {errors.adminLastName.message}
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              isLoading={isLoading}
              loadingText="Registering..."
            >
              Register
            </Button>
          </form>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColorDetails} fontWeight="400" fontSize="14px">
              Already have an account?
              <Button
                variant="link"
                color={textColorBrand}
                fontWeight="500"
                ms="5px"
                onClick={() => navigate('/auth/sign-in')}
              >
                Sign In
              </Button>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default RegisterTenant;

