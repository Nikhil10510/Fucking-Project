import React from 'react'
import Navbar from '../../components/HotelOwner/Navbar'
import Sidebar from '../../components/HotelOwner/SideBar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useEffect } from 'react'

const Layout = () => {
   const { isOwner, navigate, loading } = useAppContext()

    useEffect(() => {
        if (loading) return;
        if (!isOwner) navigate('/');
    }, [isOwner, loading]);

    if (loading) return <div>Loading...</div>;

  return (
    <div className='flex flex-col min-h-screen'>
       <Navbar />
        <div className='flex h-full'>
            <Sidebar/>
            <div className='flex-1 p-4 pt-10 md:px-10 h-full'><Outlet/></div>
        </div>
    </div>
  )
}

export default Layout
