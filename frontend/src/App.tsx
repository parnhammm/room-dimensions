import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { Navigation } from './components/shared/Navigation';

// Lazy page imports (placeholders — filled in by later phases)
import { RoomListPage } from './pages/RoomListPage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { EditRoomPage } from './pages/EditRoomPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { AddWallPage } from './pages/AddWallPage';
import { WallDetailPage } from './pages/WallDetailPage';
import { EditWallPage } from './pages/EditWallPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrintPage } from './pages/PrintPage';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Navigation />
        <main className="container mx-auto max-w-4xl px-4 py-6">
          <Routes>
            <Route path="/" element={<RoomListPage />} />
            <Route path="/rooms/new" element={<CreateRoomPage />} />
            <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
            <Route path="/rooms/:roomId/edit" element={<EditRoomPage />} />
            <Route path="/rooms/:roomId/walls/new" element={<AddWallPage />} />
            <Route path="/rooms/:roomId/walls/:wallId" element={<WallDetailPage />} />
            <Route path="/rooms/:roomId/walls/:wallId/edit" element={<EditWallPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/print" element={<PrintPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </SettingsProvider>
  );
}
