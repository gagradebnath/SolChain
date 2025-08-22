const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This is the key part to fix the web bundling issue
config.resolver.unstable_enablePackageExports = true;
config.resolver.platforms = ['ios', 'android', 'web'];

// This tells Metro to ignore react-native-maps on web
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-maps': config.resolver.platforms.includes('web')
    ? require.resolve('./shim-for-web')
    : require.resolve('react-native-maps'),
};

module.exports = config;