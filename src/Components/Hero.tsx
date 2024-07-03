import React from 'react';
import { useNavigate } from 'react-router-dom';


const Hero: React.FC = () => {

    const navigate = useNavigate()




    return (
        <div className='h-screen bg-white'>
            <div className='w-full flex flex-col justify-center items-center  z-10' >
                <div className='absolute right-40 top-40   h-[250px] mix-blend-multiply  w-[600px] z-0 bg-red- object-contain'>
                <img src="../../public/hero2.png" alt=""  className='  '/></div>
                <br />
                <br />
                <div className='w-full flex justify-center items-center text-center text-6xl font-semibold font-display bounce-once'>
                    Community Dynamics
                </div>
                <br />
                <br />
                <div className='text-xl font-arsenal font-semibold'>VISUALIZING THE WORLD'S POPULATION</div>
                <br /> <br />
                <div className='w-[60%] text-center font-roboto'>
                    "Explore the dynamic contrast of America's bustling urban centers like New York City and the tranquil expanses of the Midwest, shaped by diverse population densities and cultural richness."
                </div>
                <br /> <br />
                <div className='font-bold'>
                    Over the past 30 years, the scale of population change is hard to grasp. How do you even visualize 10 million people?
                </div>
                <br /><br />
                <div>
                    <button
                        className='w-auto rounded bg-blue-500 hover:bg-blue-600 py-3 px-5 text-white font-medium cursor-pointer z-[888888] font-roboto'
                        onClick={() => navigate("/map")}
                    >
                        View Population
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
