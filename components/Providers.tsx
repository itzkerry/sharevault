"use client";
import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ImageKitProvider urlEndpoint={urlEndpoint}>
        {children}
        <Toaster />
      </ImageKitProvider>
    </SessionProvider>
  );
};

export default Providers;
