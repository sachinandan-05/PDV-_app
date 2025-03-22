import React from 'react'
import { useNavigate } from 'react-router-dom'
const Nav:React.FC = () => {
  const navigate=useNavigate();
  return (
    <div>
      <nav className='w-full bg-slate-100  border-1 border-black h-18   shadow shadow-slate-500 z-10  '> 
        <div className='w-full flex justify-between'>
        <div className=' font-bold p-5 font-serif text-[24px] cursor-pointer ' onClick={()=>navigate("/")}>DensityVista</div>
        <div className='p-5 font-thin'>By<span className=' cursor-pointer font-roboto text-blue-400'><a href="https://www.linkedin.com/in/sachinandan-yadav-660115243?"></a> Sachinandan</span></div>
        </div>
        
      </nav>
    </div>
  )
}

export default Nav
