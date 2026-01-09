import React from 'react';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import Footer from 'components/footer/FooterAuth';
import FixedPlugin from 'components/fixedPlugin/FixedPlugin';

interface AuthIllustrationProps {
  children: React.ReactNode;
}

function AuthIllustration({ children }: AuthIllustrationProps) {
  return (
    <Flex position="relative" h="max-content">
      <Flex
        h={{
          sm: 'initial',
          md: 'unset',
          lg: '100vh',
          xl: '97vh',
        }}
        w="100%"
        maxW={{ md: '66%', lg: '1313px' }}
        mx="auto"
        pt={{ sm: '50px', md: '0px' }}
        px={{ lg: '30px', xl: '0px' }}
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        <NavLink
          to="/admin"
          style={() => ({
            width: 'fit-content',
            marginTop: '40px',
          })}
        >
          <Flex
            align="center"
            ps={{ base: '25px', lg: '0px' }}
            pt={{ lg: '0px', xl: '0px' }}
            w="fit-content"
          >
            <Icon
              as={FaChevronLeft}
              me="12px"
              h="13px"
              w="8px"
              color="secondaryGray.600"
            />
            <Text ms="0px" fontSize="sm" color="secondaryGray.600">
              Back to Dashboard
            </Text>
          </Flex>
        </NavLink>
        {children}
        <Footer />
      </Flex>
      <FixedPlugin />
    </Flex>
  );
}

export default AuthIllustration;

