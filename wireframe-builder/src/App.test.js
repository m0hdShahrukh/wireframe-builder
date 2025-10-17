import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main components', () => {
  render(<App />);
  const toolbarElement = screen.getByText(/Rectangle/i);
  expect(toolbarElement).toBeInTheDocument();
  const propertiesPanelElement = screen.getByText(/Select an element to see its properties./i);
  expect(propertiesPanelElement).toBeInTheDocument();
});
