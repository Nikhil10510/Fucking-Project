import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast'
import { useEffect } from 'react';

const DashBoard = () => {
  const { currency, user, getToken, axios } = useAppContext();

    const [dashBoardData, setDashBoardData] = useState({
      bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
    });

    const [loading, setLoading] = useState(false);


  const fetchDashBoardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      const dash = data.dashBoardData || data.dashboardData || {
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
      };
      setDashBoardData({
        bookings: Array.isArray(dash.bookings) ? dash.bookings : [],
        totalBookings: dash.totalBookings ?? 0,
        totalRevenue: dash.totalRevenue ?? 0,
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        // Optionally, navigate to login
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashBoardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">Loading dashboard...</div>
    );
  }
  return (
    <div>
      <Title
        align='left'
        font="outfit"
        title='Dashboard'
        subTitle='Monitor your room listings, track bookings and analyze revenue—all in one place. Stay updated with real time insights to ensure smooth operations.'
      />

       <div className='flex gap-4 my-8'>
        {/* Total Booking */}
        <div className='bg-blue-500/3 border border-blue-500/10 rounded flex p-4 pr-8'>
          <img src={assets.totalBookingIcon} alt="Total Bookings" className='max-sm:hidden h-10' />
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Booking</p>
            <p className='text-neutral-400 text-base'>
              {dashBoardData?.totalBookings ?? 0}
            </p>
          </div>
        </div>
        {/* Total Revenue */}
        <div className='bg-blue-500/3 border border-blue-500/10 rounded flex p-4 pr-8'>
          <img src={assets.totalRevenueIcon} alt="Total Revenue" className='max-sm:hidden h-10' />
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Revenue</p>
            <p className='text-neutral-400 text-base'>
              {currency} {(dashBoardData?.totalRevenue ?? 0)}
            </p>
          </div>
        </div>
      </div>


      <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Recent Bookings</h2>
      <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 min-h-32 overflow-y-scroll'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='py-3 px-4 text-gray-800 font-medium'>User Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden'>Room Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center'>Total Amount</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center'>Payment Status</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {dashBoardData.bookings?.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  No bookings yet.
                </td>
              </tr>
            ) : (
              dashBoardData.bookings.map((item, index) => (
                <tr key={item._id || index}>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    {item.user?.username ?? 'Unknown'}
                  </td>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                    {item.room?.roomType ?? 'Unknown Room'}
                  </td>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>
                   {currency} {(item.totalPrice ?? 0)}
                  </td>
                  <td className='py-3 px-4 border-t border-gray-300 flex'>
                    <button
                      className={`py-1 px-3 text-xs rounded-full mx-auto ${
                        item.isPaid
                          ? "bg-green-200 text-green-600"
                          : "bg-amber-200 text-yellow-600"
                      }`}
                    >
                      {item.isPaid ? 'Completed' : 'Pending'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DashBoard
