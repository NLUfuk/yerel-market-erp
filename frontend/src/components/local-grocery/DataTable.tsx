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
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th
                  key={index}
                  color={textColor}
                  borderColor={borderColor}
                  isNumeric={column.isNumeric}
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
                onClick={() => onRowClick?.(row)}
                cursor={onRowClick ? 'pointer' : 'default'}
                _hover={onRowClick ? { bg: hoverBg } : {}}
              >
                {columns.map((column, colIndex) => (
                  <Td key={colIndex} borderColor={borderColor}>
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

