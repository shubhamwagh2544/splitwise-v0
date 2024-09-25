import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { toast } from 'sonner';

// Todo: add support for all default room members to chat with each other

export default function MainRoom() {
    const [roomName, setRoomName] = useState('');
    const navigate = useNavigate();

    const handleCreateRoom = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Creating room:', roomName);
        const response = await axios.post(`${BACKEND_URL}/rooms`, { roomName });
        if (response.data) {
            console.log('Room created:', response.data);
            setRoomName('');
            toast.success('Room created successfully ✅');
            navigate(`/rooms/${response.data.id}`);
        } else {
            console.error('Failed to create room');
            toast.error('Something went wrong ❌');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Main Room</h1>
            <div className="w-full max-w-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create Room</h2>
                <form onSubmit={handleCreateRoom}>
                    <div className="mb-4">
                        <label htmlFor="roomName" className="block text-gray-700 font-medium mb-2">Room Name:</label>
                        <input
                            type="text"
                            id="roomName"
                            name="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
                        Create Room
                    </button>
                </form>
            </div>
        </div>
    );
}