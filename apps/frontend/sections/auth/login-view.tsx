'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginView() {
  const [otp, setOtp] = useState<Boolean>(false);

  const onSendOtp = () => {
    setOtp(true);
  };

  const onGoBack = () => {
    setOtp(false);
  };
  return (
    <div className="flex flex-col justify-end h-full">
      <div className="flex flex-col justify-between h-[80vh]">
        <div className="w-96 flex flex-col gap-6 mb-20">
          <Image
            className="mb-5"
            src="/assets/logo/rahat-logo.png"
            alt="rahat-logo.png"
            width={60}
            height={60}
          />
          <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-5">
            Sign In
          </h1>
          {otp ? (
            <>
              <Input className="text-md" type="email" placeholder="Enter OTP" />
              <Button className="font-bold w-full">Login</Button>
            </>
          ) : (
            <>
              <Input
                className="text-md"
                type="email"
                placeholder="Email address"
              />
              <Button className="font-bold w-full" onClick={onSendOtp}>
                Send OTP
              </Button>
            </>
          )}
          <div>
            <p>
              Don't have an account?
              <span className="font-bold"> Get Started</span>
            </p>
          </div>
        </div>
        <div>
          {otp && (
            <span className="font-bold cursor-pointer" onClick={onGoBack}>
              Go Back
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
