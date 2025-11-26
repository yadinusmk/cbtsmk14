import React from 'react';

const ResetIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M20.948 14.948A9 9 0 1114.948 3.052M3.052 9.052a9 9 0 1011.896 11.896" />
    </svg>
);

export default ResetIcon;