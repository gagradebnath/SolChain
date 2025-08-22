/**
 * Universal Safe Area View
 * 
 * A cross-platform safe area solution that works properly on web and mobile
 * 
 * @author Team GreyDevs
 */

import React from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';

const UniversalSafeArea = ({ children, style, ...props }) => {
  if (Platform.OS === 'web') {
    // For web, use a div with proper height and overflow
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...StyleSheet.flatten(style)
        }}
        {...props}
      >
        {children}
      </div>
    );
  }

  // For native platforms, use regular SafeAreaView
  return (
    <SafeAreaView style={[styles.container, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default UniversalSafeArea;
