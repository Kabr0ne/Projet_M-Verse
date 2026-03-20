'use client'
import { useState } from 'react';
import { useAuth } from '@/lib/AuthHandler';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        

        try {
            await api.post('/auth/register', { email, username, password }); //Création du compte
            await login(email, password);//connexion automatique après inscription
            router.push('/');
        } 
        catch (err) {
            setError('Registration failed. Email might already be taken.');
        }
    }

    return (
        <>
            <div className={styles.formContainer}>
                <img src="/icons/Logo_M-VERSE.png" alt="logo" className={styles.logo}/>
                <p>Create your account to start your collection</p>
                
                <form onSubmit={submitHandler}>
                    <div className={styles.input}>
                        <input className={styles.query} type='text' placeholder='Enter your username' value={username} onChange={(e)=> setUsername(e.target.value)} required/>
                    </div>
                    <div className={styles.input}>
                        <input className={styles.query} type='email' placeholder='Enter your Email' value={email} onChange={(e)=> setEmail(e.target.value)} required/>
                    </div>
                    <div className={styles.input}>
                        <input className={styles.query} type='password' placeholder='Choose a password' value={password} onChange={(e)=> setPassword(e.target.value)} required/>
                    </div>
                    <div className={styles.input}>
                        <input className={styles.query} type='password' placeholder='Confirm your password' value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} required/>
                    </div>
                    <button className={styles.submitButton} type='submit'>Register</button>
                </form>

                {error && <p className={styles.errorText}>{error}</p>}
                
                <p>
                    Already have an account ? 
                    <Link href="/login"> Log in</Link>
                </p>
            </div>
        </>
    );
}