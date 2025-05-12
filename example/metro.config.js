const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = path.resolve(__dirname);
const workspaceRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// This is the key part - it maps the package name to the source directory
config.resolver.extraNodeModules = {
  '@react-native/twitter-auth-modal-provider': path.resolve(workspaceRoot, '.'),
};

// Add additional extensions to resolve
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

module.exports = config;
