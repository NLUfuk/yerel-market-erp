import React from 'react';
import { HStack, Button, Text, Select, useColorModeValue } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

/**
 * Pagination Component
 * Pagination controls for tables and lists
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <HStack spacing={4} justify="space-between" w="100%" mt={4}>
      <HStack spacing={2}>
        <Text fontSize="sm" color={textColor}>
          Showing {startItem} to {endItem} of {totalItems} items
        </Text>
        {onItemsPerPageChange && (
          <>
            <Text fontSize="sm" color={textColor}>
              |
            </Text>
            <Select
              size="sm"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              w="120px"
              bg={bgColor}
              borderColor={borderColor}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </Select>
          </>
        )}
      </HStack>

      <HStack spacing={2}>
        <Button
          size="sm"
          onClick={handlePrevious}
          isDisabled={currentPage === 1}
          leftIcon={<ChevronLeftIcon />}
          variant="outline"
        >
          Previous
        </Button>
        <Text fontSize="sm" color={textColor} px={2}>
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          size="sm"
          onClick={handleNext}
          isDisabled={currentPage === totalPages}
          rightIcon={<ChevronRightIcon />}
          variant="outline"
        >
          Next
        </Button>
      </HStack>
    </HStack>
  );
};

export default Pagination;

