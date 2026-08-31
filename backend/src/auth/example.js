// async function handleLogin() {
//     const response = await fetch('/api/login', {
//         method: 'POST',
//         body: JSON.stringify({
//             username: 'admin',
//             password: 'password'
//         }),
//     });


// handleLogin();

// // 로그인 성공
// }

// const user = ...;
// const isLoggedIn = ...;


// {
//     id : 1,
//     name: "철수",
//     email: "chulsu@example.com",
// }

<AuthProvider>
    <Header />
    <Page />
</AuthProvider>

'use client';

import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <AuthContext.Provider 
        value={{ 
            user, 
            setUser,
        }}
        >
            {children}
        </AuthContext.Provider>
    );
};

function header() {
    return (
        <header>
            <p>{user.name}님 환영합니다.</p>
        </header>
    );
}


import { useContext } from 'react';
import { AuthContext } from './AuthContext';


function header() {
    const auth = useContext(AuthContext);
    return <p> {auth.user.name}님 환영합니다.</p>;
}

function Mypage() {
    const {user} = useContext(AuthContext);
    return <p> {auth.user.name}님 환영합니다.</p>;
}

function WritePage() {
    const {user} = useContext(AuthContext);
    return <p> 작성자: {user.name}</p>;
}