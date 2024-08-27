"use client"
import React from 'react'
import { Button } from './ui/button';
import Image from "next/image";
import arrowLeft from "@/public/images/arrow-left.svg";
import arrowRight from "@/public/images/arrow-right.svg";
import { drivers } from '@/lib/drivers';

interface ButtonProps {
    currentIndex: number;
    onForwardClick: () => void;
    onBackwardClick: () => void;
    color: string;
    onSelectName: (name: string) => void;
  }

const ChangePlayer: React.FC<ButtonProps> = ({
    currentIndex,
    onForwardClick,
    onBackwardClick,
    color,
    onSelectName
}) => {
    const currentName = drivers[currentIndex].driver;
  return (
    <Button
    onClick={() => onSelectName(currentName)}
    style={{ backgroundColor: color }}
      className={` bg-[${color}] outline-black-100 flex h-[60px] w-[270px] items-center justify-between rounded-xl p-2 px-2 text-[13px] outline outline-1 outline-offset-0`}
    >
        <Image
        src={arrowLeft}
        alt=""
        className="h-3 w-6"
        onClick={() => currentIndex !== 0 && onBackwardClick()}
      />
            {currentName}
        <Image
        src={arrowRight}
        alt=""
        className="h-3 w-6"
        onClick={() => currentIndex !== drivers.length - 1 && onForwardClick()}
      />
    </Button>
  )
}

export default ChangePlayer