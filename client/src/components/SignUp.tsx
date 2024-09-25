import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BACKEND_URL from '../config.ts';
import { useSocket } from '@/SocketProvider.tsx';

export default function SignUp() {
    const [state, setState] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const socket = useSocket();

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;
        setState({
            ...state,
            [name]: value,
        });
    }

    async function handleSubmit() {
        try {
            const response: AxiosResponse = await axios.post(`${BACKEND_URL}/auth/signup`, state, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 201) {
                // socket logic to join default room
                const user = response.data;
                socket?.emit('joinDefaultRoom', { user });

                toast.success(`Welcome, ${user?.email} 👋`);
            }

            // const { token } = response.data;
            // localStorage.setItem('token', token);

            navigate('/main-room');
        } catch (error: any) {
            if (error.response.status === 409) {
                toast.success('Account already exists! Please sign in ❌');
            } else {
                toast.error('Something went wrong ❌');
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Sign Up</h1>
            <div className="w-full max-w-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create an Account</h2>
                <div className="flex flex-col gap-4 mt-5">
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        onChange={handleInputChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                        onClick={handleSubmit}
                    >
                        Sign Up
                    </button>
                </div>
                <div className="text-center mt-5">
            <span className="text-sm">
                Already Have an Account?
                <Link to="/signin" className="text-blue-500 hover:underline">
                    {' '}
                    Sign In{' '}
                </Link>
            </span>
                </div>
            </div>
        </div>
    );
}
