import { PrintFloor, PrintFloorRoom, PrintSummaryResponse } from '../../types';
import { EmptyState } from '../shared/EmptyState';

interface PrintSummaryProps {
  data: PrintSummaryResponse;
}

// eslint-disable-next-line max-lines-per-function
function RoomEntry({ room, unit }: { room: PrintFloorRoom; unit: string }) {
  return (
    <div key={room.id} className="mb-6 pl-4">
      <h3 className="mb-3 text-lg font-semibold">{room.label}</h3>
      {room.floorDimension && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-700">Floor Size</h4>
          <p className="ml-4 text-gray-600">
            {room.floorDimension.width} × {room.floorDimension.length} {unit}
          </p>
        </div>
      )}
      {room.ceilingDimension && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-700">Ceiling Size</h4>
          <p className="ml-4 text-gray-600">
            {room.ceilingDimension.width} × {room.ceilingDimension.length} {unit}
          </p>
        </div>
      )}
      {room.floorSegments.length > 0 && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-700">Floor Dimensions</h4>
          <ul className="ml-4 list-disc">
            {room.floorSegments.map((s) => (
              <li key={s.id}>
                {s.label}: {s.measurement} {unit}
                {s.width !== null && <span className="ml-1 text-gray-500">W: {s.width} {unit}</span>}
                {s.length !== null && <span className="ml-1 text-gray-500">L: {s.length} {unit}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {room.ceilingSegments.length > 0 && (
        <div className="mb-2">
          <h4 className="font-medium text-gray-700">Ceiling Dimensions</h4>
          <ul className="ml-4 list-disc">
            {room.ceilingSegments.map((s) => (
              <li key={s.id}>
                {s.label}: {s.measurement} {unit}
                {s.width !== null && <span className="ml-1 text-gray-500">W: {s.width} {unit}</span>}
                {s.length !== null && <span className="ml-1 text-gray-500">L: {s.length} {unit}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {room.walls.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700">Walls</h4>
          {room.walls.map((w) => (
            <div key={w.id} className="ml-4 mb-1">
              <span className="font-medium">{w.label}</span>
              <span className="ml-2 text-gray-600">{w.width} × {w.height} {unit}</span>
              {w.windows.length > 0 && (
                <ul className="ml-4 list-disc text-sm text-gray-600">
                  {w.windows.map((win) => (
                    <li key={win.id}>{win.label}: {win.width} × {win.height} {unit}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FloorSection({ floor, unit }: { floor: PrintFloor; unit: string }) {
  return (
    <section key={floor.floor} className="mb-8">
      <h2 className="mb-4 border-b-2 border-gray-800 pb-2 text-xl font-bold">{floor.floor}</h2>
      {floor.rooms.map((room) => (
        <RoomEntry key={room.id} room={room} unit={unit} />
      ))}
    </section>
  );
}

export function PrintSummary({ data }: PrintSummaryProps) {
  if (data.floors.length === 0) {
    return <EmptyState message="No rooms to display. Add some rooms first." />;
  }

  return (
    <div className="print:text-black">
      {data.floors.map((floor) => (
        <FloorSection key={floor.floor} floor={floor} unit={data.unit} />
      ))}
    </div>
  );
}
