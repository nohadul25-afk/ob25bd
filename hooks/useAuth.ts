import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            // Simulate API call
            const response = await fakeApiCall('/login', { email, password });
            setUser(response.user);
            sessionStorage.setItem('user', JSON.stringify(response.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const signup = async (email, password) => {
        try {
            // Simulate API call
            const response = await fakeApiCall('/signup', { email, password });
            setUser(response.user);
            sessionStorage.setItem('user', JSON.stringify(response.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    return { user, error, loading, login, signup, logout };
};

// Mock API call function (to be replaced with actual API)
const fakeApiCall = (url, data) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (url === '/login' && data.email === 'test@example.com' && data.password === 'password') {
                resolve({ user: { email: data.email } });
            } else if (url === '/signup') {
                resolve({ user: { email: data.email } });
            } else {
                reject(new Error('Invalid credentials')); 
            }
        }, 1000);
    });
};

export default useAuth;
