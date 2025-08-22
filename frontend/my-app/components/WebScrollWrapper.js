/**
 * Web Scroll Wrapper Component
 * 
 * Provides proper scrolling behavior for React Native Web applications
 * 
 * @author Team GreyDevs
 */

import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

const WebScrollWrapper = ({ children, style }) => {
  if (Platform.OS === 'web') {
    return (
      <div 
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          ...style
        }}
      >
        {children}
      </div>
    );
  }
  
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebScrollWrapper;
