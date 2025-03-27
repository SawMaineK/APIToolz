/** @type { import('@storybook/react').Preview } */
import '@/components/keenicons/assets/styles.css';
import "../resources/js/src/styles/globals.css";
import "flatpickr/dist/flatpickr.min.css";
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
