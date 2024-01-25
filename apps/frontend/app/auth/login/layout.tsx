import Image from 'next/image';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="px-20 py-5 h-screen">
      <section className="h-full">
        <div className="grid grid-cols-3 gap-10 h-full">
          <div className="col-span-3 sm:col-span-1">{children}</div>
          <div className="col-span-2 relative hidden sm:block">
            <Image
              src="/assets/background/front_image.png"
              alt="login-bg"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
