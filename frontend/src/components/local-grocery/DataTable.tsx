import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import Card from './Card';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  isNumeric?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/**
 * DataTable Component
 * Generic table component for displaying data
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
}: DataTableProps<T>) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  if (loading) {
    return (
      <Card>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                {columns.map((_, index) => (
                  <Th key={index}>
                    <Skeleton height="20px" />
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <Tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <Td key={colIndex}>
                      <SkeletonText noOfLines={1} />
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card p="40px">
        <Text textAlign="center" color={textColor} fontSize="md">
          {emptyMessage}
        </Text>
      </Card>
    );
  }

  const renderCell = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor as keyof T];
  };

  return (
    <Card>
      <TableContainer overflowX="auto">
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th
                  key={index}
                  color={textColor}
                  borderColor={borderColor}
                  isNumeric={column.isNumeric}
                  whiteSpace="nowrap"
                >
                  {column.header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                onClick={onRowClick ? (e) => {
                  // Only trigger row click if the click target is not an interactive element
                  const target = e.target as HTMLElement;
                  const isInteractiveElement = 
                    target.tagName === 'BUTTON' ||
                    target.tagName === 'INPUT' ||
                    target.tagName === 'A' ||
                    target.tagName === 'LABEL' ||
                    target.tagName === 'SPAN' ||
                    target.closest('button') !== null ||
                    target.closest('input') !== null ||
                    target.closest('a') !== null ||
                    target.closest('label') !== null ||
                    target.closest('[role="button"]') !== null ||
                    target.closest('[role="switch"]') !== null ||
                    target.closest('[role="checkbox"]') !== null ||
                    target.closest('.chakra-switch') !== null ||
                    target.closest('.chakra-button') !== null ||
                    target.closest('[data-cursor-element-id]')?.getAttribute('data-cursor-element-id')?.includes('switch') ||
                    target.closest('[data-cursor-element-id]')?.getAttribute('data-cursor-element-id')?.includes('button');
                  
                  if (!isInteractiveElement) {
                    onRowClick(row);
                  } else {
                    // Always stop propagation for interactive elements
                    e.stopPropagation();
                    e.preventDefault();
                  }
                } : undefined}
                cursor={onRowClick ? 'pointer' : 'default'}
                _hover={onRowClick ? { bg: hoverBg } : {}}
              >
                {columns.map((column, colIndex) => (
                  <Td 
                    key={colIndex} 
                    borderColor={borderColor}
                    whiteSpace="nowrap"
                  >
                    {renderCell(row, column)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default DataTable;

