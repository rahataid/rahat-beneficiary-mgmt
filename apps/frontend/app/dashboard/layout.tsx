'use client';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useNavData } from '@/layout/config-nav';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { paths } from '@/routes/paths';
import Link from 'next/link';

type NavData = {
  title: string;
  icon: string;
  path: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navData = useNavData();
  const router = useRouter();
  const currentRoute = usePathname();

  const onGoBack = () => {
    router.back();
  };

  return (
    <main className="px-20 h-screen">
      <section className="h-full">
        <div className="grid grid-cols-4 h-full">
          <div className="border-x-2 w-full h-full">
            <div className="p-5 h-full">
              <Image
                className="mb-20"
                src="/assets/logo/rahat-logo.png"
                alt="rahat-logo.png"
                width={60}
                height={60}
              />
              <div className="flex flex-col justify-between h-[82vh]">
                <div className="flex flex-col gap-2">
                  {navData.map((item: NavData) => (
                    <div
                      className={`flex gap-2 p-3  rounded hover:bg-[#DDF6FC] hover:text-[#1F61AC] cursor-pointer ${
                        currentRoute === item.path &&
                        'bg-[#DDF6FC] text-[#1F61AC] '
                      }`}
                      onClick={() => router.push(item.path)}
                    >
                      <Image
                        key={item.title}
                        src={item.icon}
                        alt={item.title.toLowerCase()}
                        width={30}
                        height={30}
                      />
                      <div className="flex items-center">
                        <span className="font-bold">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-bold cursor-pointer" onClick={onGoBack}>
                    Go Back
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="p-5 flex justify-end">
              <div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Avatar>
                        <AvatarImage
                          src="/assets/svg/profile-icon.svg"
                          alt="profile-icon"
                        />
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup className="p-2">
                        <div className="p-2 flex flex-col">
                          <span className="font-bold">Rocket</span>
                          <span>rocket@gmail.com</span>
                        </div>
                        <div className="p-2">
                          <Link href={paths.dashboard.root}>Home</Link>
                        </div>
                        <div className="text-red-500 p-2">
                          <Link href={paths.auth.login}>Logout</Link>
                        </div>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <div>{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
