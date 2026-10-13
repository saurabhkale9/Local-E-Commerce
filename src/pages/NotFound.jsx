import React from 'react'
import { Link } from 'react-router'

function NotFound() {
    return (
        <div className='w-full h-screen flex justify-center items-center flex-col'>
            404 Page not found
            <Link className='px-4 py-1 rounded-xl bg-black text-white' to={"/"}>Goback</Link>
        </div>
    )
}

export default NotFound
