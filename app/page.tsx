"use client"
import Image from "next/image";
import helmet from "@/public/images/helmet.png";
import { drivers } from "@/lib/drivers";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner"
import ChangePlayer from "@/components/ChangePlayer";
import { Button } from "@/components/ui/button";

import CreateNft from "@/components/CreateNft";


export const grandPrix = "FORMULA 1 HEINEKEN SILVER LAS VEGAS GRAND PRIX 2023";

export default function Home() {

  // State for each button's currentIndex
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(1);
  const [currentIndex3, setCurrentIndex3] = useState(2);

  // Compute the values to pass to CreateNft
  const racerNames = [
    drivers[currentIndex1].driver,
    drivers[currentIndex2].driver,
    drivers[currentIndex3].driver,
  ];
  const uniqueRacerNames = new Set(racerNames);

  const first = drivers[currentIndex1].driver.replace(/\s/g, "-");
  const second = drivers[currentIndex2].driver.replace(/\s/g, "-");
  const third = drivers[currentIndex3].driver.replace(/\s/g, "-");
  const race = grandPrix.replace(/\s/g, "-");
  

// Function to handle forward click
const handleForwardClick = (
  setCurrentIndex: (index: number) => void,
  currentIndex: number,
) => {
  if (currentIndex < drivers.length - 1) {
    setCurrentIndex(currentIndex + 1);
  }
};

// Function to handle backward click
const handleBackwardClick = (
  setCurrentIndex: (index: number) => void,
  currentIndex: number,
) => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
  }
};

  return (
   <>
   <div className="mt-40 flex h-full w-full flex-col  items-start justify-start md:mt-12 md:items-center md:justify-center  lg:scale-75 2xl:scale-90 ">
   <section className="container relative flex h-auto flex-col items-center justify-center rounded-md bg-[#FFF7EA] ">
          <div className="-mt-12">
            <p className=" rowdies-400 font-outline-2 text-[70px] font-black text-[#55CBCD]">
              PODIUM
            </p>
          </div>
          <div className="rounded-2xl bg-bg-mid px-4">
            <p>The on-chain mini league</p>
          </div>

          <div className=" mt-10 flex w-full flex-col items-center justify-center gap-8 px-8 py-4 md:mt-0 md:flex-row md:gap-12 ">
          <div className="container h-full w-full md:w-1/3">
              <div className="flex w-full flex-row items-center justify-start">
                <p className="flex w-full flex-row items-center text-3xl font-bold">
                  Pick your racer
                </p>
                <Image
                  src={helmet}
                  className="h-[50px] w-[50px]"
                  alt=""
                  width={53}
                  height={59}
                />
              </div>
              <div className="mt-3 grid w-full grid-cols-1 justify-start gap-2">
                <div className="mt-5 flex h-[80px] w-full flex-row items-center justify-between gap-[24px]">
                  <span className=" num rowdies-300 w-[15%] text-center text-[30px]">
                    1st
                  </span>
                  <ChangePlayer
                  color={"#F6EAC2"}
                  currentIndex={currentIndex2}
                  onSelectName={() => {}}
                  onForwardClick={() =>
                    handleForwardClick(setCurrentIndex2, currentIndex2)
                  }
                  onBackwardClick={() =>
                    handleBackwardClick(setCurrentIndex2, currentIndex2)
                  }
                  />
                </div>

                <div className="mt-5 flex h-[80px] w-full flex-row items-center justify-between gap-[24px]">
                  <span className="num rowdies-300 w-[15%] text-center text-[30px]">
                    2nd
                  </span>
                  <ChangePlayer 
                  currentIndex={currentIndex1}
                  onSelectName={() => {}}
                  onForwardClick={() =>
                    handleForwardClick(setCurrentIndex1, currentIndex1)
                  }
                  onBackwardClick={() =>
                    handleBackwardClick(setCurrentIndex1, currentIndex1)
                  }
                  color={"#DFCCF1"}
                  />
                </div>

                <div className="mt-5 flex h-[80px] w-full flex-row items-center justify-between gap-[24px]">
                  <span className="num rowdies-300 w-[15%] text-center text-[30px]">
                    3rd
                  </span>
                  <ChangePlayer 
                   currentIndex={currentIndex3}
                   onSelectName={() => {}}
                   onForwardClick={() =>
                     handleForwardClick(setCurrentIndex3, currentIndex3)
                   }
                   onBackwardClick={() =>
                     handleBackwardClick(setCurrentIndex3, currentIndex3)
                   }
                   color={"#FFB8B1"}
                  />
                </div>
              </div>
            </div>

            <div className=" container flex h-full w-full flex-col gap-4">
                <div className="relative w-full">
                <div className="flex w-full items-center justify-center">
                  <div className="mx-auto h-full min-h-[350px] w-full rounded-lg border border-black  bg-background-illustration bg-cover bg-center bg-no-repeat md:h-1/3 md:min-h-[420px]"> </div>
                </div>

                   <div className="absolute inset-0 flex h-full w-full flex-row items-end justify-center gap-4 p-4">
                   <div className=" flex w-1/3 flex-col items-center justify-center">
                    <img
                      src="/images/podium_silver.webp"
                      alt="second winner"
                      className="relative z-10 h-full w-[95%]"
                    />
                    <div className="relative z-0 -mt-4 rounded-lg border border-black bg-second-place p-4 py-6 text-center">
                      {drivers[currentIndex1].driver}&trade;
                    </div>
                  </div>

                  <div className="-mt-12 flex w-1/3 flex-col items-center justify-center">
                    <img
                      src="/images/podium_gold.webp"
                      alt="winner"
                      className="relative z-10 h-full w-[100%]"
                    />
                    <div className="relative z-0 -mt-4 rounded-lg border border-black bg-first-place p-4 py-8 text-center">
                      {drivers[currentIndex2].driver}&trade;
                    </div>
                  </div>

                  <div className="flex w-1/3 flex-col items-center justify-center">
                    <img
                      src="/images/podium_bronze.webp"
                      alt="third winner"
                      className="relative z-10 h-full w-[95%]"
                    />
                    <div className="relative z-0  -mt-4 rounded-lg border border-black bg-third-place p-4 text-center">
                      {drivers[currentIndex3].driver}&trade;
                    </div>
                  </div>
                   </div>
                </div>

                <div className="relative">
               <CreateNft
                first={first}
                second={second}
                third={third}
                race={race}
                hasDuplicate={racerNames.length !== uniqueRacerNames.size}
                
               />
                  <div className="absolute -bottom-1 z-10 h-full w-full rounded-2xl bg-[#B5EAD6]"></div>
                </div>
            </div>

          </div>
      </section>
   </div>
   </>
  );
}