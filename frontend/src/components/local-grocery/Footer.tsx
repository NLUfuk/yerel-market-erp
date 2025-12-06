import React from 'react';
import {
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface FooterProps {}

/**
 * Footer Component
 * Application footer with copyright information
 */
export const Footer: React.FC<FooterProps> = () => {
  const textColor = useColorModeValue('gray.400', 'white');

  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: 'column',
        xl: 'row',
      }}
      alignItems={{
        base: 'center',
        xl: 'start',
      }}
      justifyContent="space-between"
      px={{ base: '30px', md: '50px' }}
      pb="30px"
    >
      <Text
        color={textColor}
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        mb={{ base: '20px', xl: '0px' }}
      >
        &copy; {new Date().getFullYear()}{' '}
        <Text as="span" fontWeight="500" ms="4px">
          Local Grocery Hub. All Rights Reserved.
        </Text>
      </Text>
    </Flex>
  );
};

export default Footer;

