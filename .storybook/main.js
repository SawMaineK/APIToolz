/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    "../resources/js/src/**/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-postcss"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
