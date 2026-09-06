"use client";
import React from 'react'
import {create} from 'zustand'

interface BearStore{
    bears: number;
    increasePopulation: ()=> void;
    removeAllBears : ()=>void;
    updateBears: (newBears:number) => void;
}
  const renderBears =(bears:number) =>{
    const bear="🐻"
    return bear.repeat(bears)
  }
  const useBear= create<BearStore>(
    (set)=>({
        bears:0,
        increasePopulation: () => (
            set((state)=>({
                bears: state.bears +1, 
            }))
        ),
        removeAllBears: ()=> (
            set({
                bears:0,
            })
        ),
        updateBears: (newBears) =>(
            set({
                bears: newBears
            })
        )
    })
  )
function Page() {
   const bears= useBear((state)=> state.bears)
   const increaseBear=useBear((state)=> state.increasePopulation)
  return (
    <div>
       <p>{renderBears(bears)}</p>
    
       <button onClick={increaseBear}> increase bear </button>
    </div>
  )
}

export default Page