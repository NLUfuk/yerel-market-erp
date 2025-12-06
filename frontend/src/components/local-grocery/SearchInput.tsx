import React, { useState, useEffect } from 'react';
import { Input, InputGroup, InputLeftElement, useColorModeValue } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  value?: string;
}

/**
 * SearchInput Component
 * Search input with debounce functionality
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  value: controlledValue,
}) => {
  const [localValue, setLocalValue] = useState(controlledValue || '');
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : localValue;

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setLocalValue(newValue);
    }
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        bg={bgColor}
        color={textColor}
        borderColor={borderColor}
        _placeholder={{ color: 'gray.400' }}
      />
    </InputGroup>
  );
};

export default SearchInput;

