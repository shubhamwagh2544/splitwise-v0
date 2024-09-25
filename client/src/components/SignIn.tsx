import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config.ts';
import { toast } from 'sonner';
import { useSocket } from '@/SocketProvider.tsx';

export default function SignIn() {
    const [state, setState] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const socket = useSocket();

    if (!socket) {
        return (
            <div>
                <h1>Connecting...</h1>
            </div>
        );
    }

    async function handleSubmit() {
        try {
            const response: AxiosResponse = await axios.post(`${BACKEND_URL}/auth/signin`, state, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                // socket logic to join default room
                const user = response.data;
                console.log('user', user);
                socket?.emit('joinDefaultRoom', { user });

                toast.success(`Welcome, ${user?.email} 👋`);
            }

            // const { token } = response.data;
            // localStorage.setItem('tok1en', token);

            navigate('/main-room');
        } catch (error: any) {
            if (error.response.status === 404) {
                toast.error('Account not found! Please sign up ❌');
            }
            if (error.response.status === 401) {
                toast.error('Invalid credentials! Please try again ❌');
            } else {
                toast.error('Something went wrong ❌');
            }
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setState({
            ...state,
            [name]: value,
        });
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Sign In</h1>
            <div className="w-full max-w-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Welcome Back</h2>
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
                        Sign In
                    </button>
                </div>
                <div className="text-center mt-5">
            <span className="text-sm">
                Don\'t Have an Account?
                <Link to="/" className="text-blue-500 hover:underline">
                    {' '}
                    Sign Up{' '}
                </Link>
            </span>
                </div>
            </div>
        </div>
    );
}
