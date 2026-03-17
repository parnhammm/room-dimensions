import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="border-b bg-white shadow-sm print:hidden" aria-label="Main navigation">
      <div className="container mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
        <Link to="/" className="font-semibold text-gray-900 hover:text-blue-600">
          Rooms
        </Link>
        <Link to="/settings" className="text-gray-600 hover:text-blue-600">
          Settings
        </Link>
        <Link to="/print" className="text-gray-600 hover:text-blue-600">
          Print Summary
        </Link>
      </div>
    </nav>
  );
}
