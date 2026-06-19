//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const withFlowbiteReact = require('flowbite-react/plugin/nextjs');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withFlowbiteReact,
];

module.exports = composePlugins(...plugins)(nextConfig);
