import { Button } from "./ui/button";
import { useEffect, useState } from 'react';
import axios from 'axios';
import BACKEND_URL from '@/config.ts';
import { get, isEmpty, isNil } from 'lodash';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';

export default function MainRoom() {

    const [room, setRoom] = useState("");
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    // const { user, loading } = useLoggedInUser();
    const userId = get(location, 'state.userId', null);

    useEffect(() => {
        // Fetch all users
        async function fetchUsers() {
            const response = await axios.get(`${BACKEND_URL}/user`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setUsers(response.data);
        }
        fetchUsers()
            .then(() => console.log('users fetched successfully'))
            .catch((error) => console.error('error fetching users', error));

        // Fetch all rooms
        async function fetchRooms() {
            const response = await axios.get(`${BACKEND_URL}/room/${userId}/rooms`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setRooms(response.data);
        }
        fetchRooms()
            .then(() => console.log("Rooms fetched successfully"))
            .catch((error) => console.error("Error fetching rooms", error));
    }, []);

    async function createRoomHandler() {
        if (isEmpty(room.trim()) || isNil(room)) {
            toast.error('Room name is required');
            setRoom("");
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/room`, {name: room, userId}, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            } );
            const data = response.data;
            if (response.status === 201) {
                navigate(`/room/${data.id}`);
            }
        } catch (error: any) {
            if (error.status === 409) {
                toast.error('Room already exists');
                setRoom("");
            }
            console.error('error creating room', error);
        }
    }

    if (isEmpty(users)) {
        return (
            <div>
                <h1>No users found. Please create a room to get started</h1>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-8 p-4">
            <div className="w-1/2">
                <h2 className="text-lg font-semibold mb-4">Your Rooms</h2>
                {isEmpty(rooms) ? (
                    <p>No rooms found. Create a new room to get started!</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {rooms.map((data) => (
                            <li key={get(data, 'room.id', 'N/A')} className="mb-2">
                                <Link to={`/room/${get(data, 'room.id', 'N/A')}`}>
                                    {get(data, 'room.name', 'N/A')}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="w-1/2">
                <div className="mb-4">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Create Room</CardTitle>
                            <CardDescription>Create your room to add expenses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Name of your room"
                                            value={room}
                                            onChange={(e) => setRoom(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={createRoomHandler}>Create</Button>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-4">All Users</h2>
                    {isEmpty(users) ? (
                        <p>No users found.</p>
                    ) : (
                        <div className="list-disc list-inside">
                            {users
                                .filter((u) => get(u, 'id') !== userId)
                                .map((user) => (
                                    <div key={get(user, 'id', 'N/A')} className="mb-2">
                                        {get(user, 'firstName', 'N/A')} {get(user, 'lastName', 'N/A')}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}