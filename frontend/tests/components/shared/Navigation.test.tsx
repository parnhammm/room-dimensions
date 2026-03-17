import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from '../../../src/components/shared/Navigation';

describe('Navigation', () => {
  function renderNav() {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    );
  }

  it('renders the Rooms link', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /rooms/i })).toBeInTheDocument();
  });

  it('renders the Settings link', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders the Print Summary link', () => {
    renderNav();
    expect(screen.getByRole('link', { name: /print summary/i })).toBeInTheDocument();
  });

  it('has a nav landmark with accessible label', () => {
    renderNav();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });
});
