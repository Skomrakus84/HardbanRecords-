import { Box, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Flex h="100vh">
      {/* Sidebar Navigation */}
      <Box w="250px" bg="gray.100" p={4}>
        <nav>
          <ChakraLink as={RouterLink} to="/" display="block" mb={2}>
            Home
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/music" display="block" mb={2}>
            Music Publishing
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/publishing" display="block" mb={2}>
            Digital Publishing
          </ChakraLink>
        </nav>
      </Box>
      
      {/* Main Content */}
      <Box flex="1" p={4}>
        {children}
      </Box>
    </Flex>
  );
};

export default MainLayout;