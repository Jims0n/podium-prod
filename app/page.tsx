import Image from "next/image";
import helmet from "@/public/images/helmet.png";
import { drivers } from "@/lib/drivers";

import { useState } from "react";



export default function Home() {


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
                  
                </div>

                <div className="mt-5 flex h-[80px] w-full flex-row items-center justify-between gap-[24px]">
                  <span className="num rowdies-300 w-[15%] text-center text-[30px]">
                    2nd
                  </span>
                 
                </div>

                <div className="mt-5 flex h-[80px] w-full flex-row items-center justify-between gap-[24px]">
                  <span className="num rowdies-300 w-[15%] text-center text-[30px]">
                    3rd
                  </span>
                 
                </div>
              </div>
            </div>
          </div>
      </section>
   </div>
   </>
  );
}
