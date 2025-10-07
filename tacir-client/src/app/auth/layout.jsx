import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="relative h-screen w-screen">
      <Image
        alt="Tacir Background image"
        src="/images/tacir-bg.jpg"
        fill
        // cover
        className="absolute inset-0 -z-10"
        priority
      />

      <div className="flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-3xl justify-center bg-white bg-opacity-10 p-8 rounded-lg shadow-lg backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
