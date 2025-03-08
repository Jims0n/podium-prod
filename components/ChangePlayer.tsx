"use client"
import React from 'react'
import { Button } from './ui/button';
import Image from "next/image";
import { drivers } from '@/constants/drivers';

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
            className={`outline-black-100 flex h-[60px] w-[270px] items-center justify-between rounded-xl p-2 px-2 text-[13px] outline outline-1 outline-offset-0`}
        >
            <div
                className="h-6 w-6 cursor-pointer flex items-center justify-center"
                onClick={(e) => {
                    e.stopPropagation();
                    currentIndex !== 0 && onBackwardClick();
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <span className="text-center font-medium">{currentName}</span>
            <div
                className="h-6 w-6 cursor-pointer flex items-center justify-center"
                onClick={(e) => {
                    e.stopPropagation();
                    currentIndex !== drivers.length - 1 && onForwardClick();
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </Button>
    )
}

export default ChangePlayer 