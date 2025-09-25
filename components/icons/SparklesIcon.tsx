import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--theme-orange)" />
                <stop offset="100%" stopColor="var(--theme-bright-orange)" />
            </linearGradient>
        </defs>
        <path fill="url(#g)" d="M12 2.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM6.166 6.166a.75.75 0 011.06 0l2.122 2.121a.75.75 0 01-1.06 1.06L6.166 7.226a.75.75 0 010-1.06zM3 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3A.75.75 0 013 12zm3.166 5.834a.75.75 0 010 1.06l-2.122 2.122a.75.75 0 01-1.06-1.06l2.122-2.122a.75.75 0 011.06 0zM12 18a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 18zm5.834-3.166a.75.75 0 011.06 0l2.122 2.122a.75.75 0 01-1.06 1.06l-2.122-2.122a.75.75 0 010-1.06zM21 12a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zm-3.166-5.834a.75.75 0 010-1.06l2.122-2.121a.75.75 0 011.06 1.06L17.834 7.226a.75.75 0 01-1.06 0z" />
    </svg>
);