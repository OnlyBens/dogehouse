/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

/*
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
*/
// const path = require('path');

// const linkedLibs = [path.resolve(__dirname, '../', 'node_modules')];
// console.info('CONFIG', linkedLibs);

// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
//   watchFolders: linkedLibs,
// };

const {
  extraNodeModules,
  watchFolders,
} = require('react-native-yarn-workspaces-v2')(__dirname);
const path = require('path');

module.exports = {
  watchFolders,
  resolver: {
    extraNodeModules,
  },
  // Generated by `react-native`.
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  // end
};
