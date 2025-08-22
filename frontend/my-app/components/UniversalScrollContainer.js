/**
 * Universal Scroll Container
 * 
 * A cross-platform scrolling solution that works properly on web and mobile
 * 
 * @author Team GreyDevs
 */

import React, { forwardRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

const UniversalScrollContainer = forwardRef(({ 
  children, 
  style, 
  contentContainerStyle,
  showsVerticalScrollIndicator = true,
  refreshControl,
  onScroll,
  scrollEnabled = true,
  ...props 
}, ref) => {
  
  if (Platform.OS === 'web') {
    // For web, use a div with proper CSS
    return (
      <div
        ref={ref}
        style={{
          flex: 1,
          overflowY: scrollEnabled ? 'auto' : 'hidden',
          overflowX: 'hidden',
          height: '100%',
          ...StyleSheet.flatten(style)
        }}
        onScroll={onScroll}
        {...props}
      >
        <div
          style={{
            ...StyleSheet.flatten(contentContainerStyle),
            minHeight: '100%'
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // For native platforms, use regular ScrollView
  return (
    <ScrollView
      ref={ref}
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={refreshControl}
      onScroll={onScroll}
      scrollEnabled={scrollEnabled}
      {...props}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default UniversalScrollContainer;
