const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAllowMultipleEntries: true,
      },
    },
    argv
  );

  // Ensure CSS files are processed
  config.resolve.extensions.push('.css');
  
  // Add rule for CSS files if not already present
  const cssRule = {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  };
  
  const hasStyleLoader = config.module.rules.some(rule => 
    rule.use && rule.use.some(loader => 
      typeof loader === 'string' ? loader.includes('style-loader') : 
      loader.loader && loader.loader.includes('style-loader')
    )
  );
  
  if (!hasStyleLoader) {
    config.module.rules.push(cssRule);
  }

  return config;
};
