import { useParams } from 'react-router-dom';

export default function RoomDashboard() {
    const { roomId } = useParams<{ roomId: string }>();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Room Dashboard</h1>
            <p className="text-2xl">Welcome to Room: {roomId}</p>
        </div>
    );
}