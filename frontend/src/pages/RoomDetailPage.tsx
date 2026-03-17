import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { roomsService } from '../services/roomsService';
import { segmentsService } from '../services/segmentsService';
import { wallsService } from '../services/wallsService';
import { RoomDetailResponse, SegmentResponse, WallSummaryResponse } from '../types';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { SegmentList } from '../components/dimensions/SegmentList';
import { WallList } from '../components/walls/WallList';

export function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const id = parseInt(roomId!, 10);
  const [room, setRoom] = useState<RoomDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floorSegs, setFloorSegs] = useState<SegmentResponse[]>([]);
  const [ceilSegs, setCeilSegs] = useState<SegmentResponse[]>([]);
  const [walls, setWalls] = useState<WallSummaryResponse[]>([]);

  const loadRoom = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [r, fs, cs, ws] = await Promise.all([
        roomsService.getRoom(id),
        segmentsService.getSegments(id, 'floor'),
        segmentsService.getSegments(id, 'ceiling'),
        wallsService.getWalls(id),
      ]);
      setRoom(r); setFloorSegs(fs); setCeilSegs(cs); setWalls(ws);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadRoom(); }, [loadRoom]);

  if (loading) return <LoadingSpinner />;
  if (error || !room) return <ErrorMessage message={error ?? 'Room not found'} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{room.label}</h1>
          <p className="text-gray-500">{room.floor}</p>
        </div>
        <Link to={`/rooms/${roomId}/edit`} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200">Edit Room</Link>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Floor Dimensions</h2>
        <SegmentList segments={floorSegs} loading={false} error={null} surfaceLabel="floor"
          onAdd={async (v) => { const s = await segmentsService.addSegment(id, { ...v, surfaceType: 'floor' }); setFloorSegs((p) => [...p, s]); }}
          onUpdate={async (sid, v) => { const s = await segmentsService.updateSegment(id, sid, v); setFloorSegs((p) => p.map((x) => x.id === sid ? s : x)); }}
          onDelete={async (sid) => { await segmentsService.deleteSegment(id, sid); setFloorSegs((p) => p.filter((x) => x.id !== sid)); }} />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Ceiling Dimensions</h2>
        <SegmentList segments={ceilSegs} loading={false} error={null} surfaceLabel="ceiling"
          onAdd={async (v) => { const s = await segmentsService.addSegment(id, { ...v, surfaceType: 'ceiling' }); setCeilSegs((p) => [...p, s]); }}
          onUpdate={async (sid, v) => { const s = await segmentsService.updateSegment(id, sid, v); setCeilSegs((p) => p.map((x) => x.id === sid ? s : x)); }}
          onDelete={async (sid) => { await segmentsService.deleteSegment(id, sid); setCeilSegs((p) => p.filter((x) => x.id !== sid)); }} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Walls</h2>
          <Link to={`/rooms/${roomId}/walls/new`} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">+ Add Wall</Link>
        </div>
        <WallList roomId={id} walls={walls} loading={false} error={null}
          onDelete={async (wid) => { await wallsService.deleteWall(id, wid); setWalls((p) => p.filter((x) => x.id !== wid)); }} />
      </section>
    </div>
  );
}
