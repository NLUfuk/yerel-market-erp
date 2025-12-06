import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { SidebarContext } from 'contexts/SidebarContext';
import SignIn from 'views/auth/signIn';
import RegisterTenant from 'views/auth/registerTenant';

export default function Auth() {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const authBg = useColorModeValue('white', 'navy.900');
  
  document.documentElement.dir = 'ltr';
  
  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Box
          bg={authBg}
          float="right"
          minHeight="100vh"
          height="100%"
          position="relative"
          w="100%"
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Box mx="auto" minH="100vh">
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/register-tenant" element={<RegisterTenant />} />
              <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
            </Routes>
          </Box>
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}

