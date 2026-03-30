'use client';

import React, { useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(13, 148, 136, 0.15)",
    ...props
}: SpotlightCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-3xl bg-white/60 dark:bg-background overflow-hidden shadow-sm backdrop-blur-sm",
                className
            )}
            {...props}
        >
            <div className="relative h-full">
                {children}
            </div>
        </div>
    );
}
