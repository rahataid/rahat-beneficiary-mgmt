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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
    <div className="flex h-screen px-10">
      <nav className=" hidden lg:block fixed border-x-2 w-80 p-4 h-full overflow-y-auto">
        <div>
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
                  key={item.title}
                  className={`flex gap-2 p-3  rounded hover:bg-[#DDF6FC] hover:text-[#1F61AC] cursor-pointer ${
                    currentRoute === item.path && 'bg-[#DDF6FC] text-[#1F61AC] '
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
      </nav>
      <div className="flex-1 lg:ml-80">
        <div className="p-4 mb-4 w-full z-10">
          <div className="flex justify-between lg:justify-end">
            <div className="block lg:hidden">
              <Sheet>
                <SheetTrigger>
                  <Image
                    src="/assets/svg/burger-menu-icon.svg"
                    alt="burger-menu-icon"
                    height={20}
                    width={30}
                  />
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="p-5 h-full">
                    <Image
                      className="mb-10"
                      src="/assets/logo/rahat-logo.png"
                      alt="rahat-logo.png"
                      width={60}
                      height={60}
                    />
                    <div className="flex flex-col justify-between h-full">
                      <div className="flex flex-col gap-2">
                        {navData.map((item: NavData) => (
                          <div
                            key={item.title}
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
                        <span
                          className="font-bold cursor-pointer"
                          onClick={onGoBack}
                        >
                          Go Back
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
                <DropdownMenuContent className="mr-5" side="bottom">
                  <DropdownMenuGroup className="p-2">
                    <div className="p-2 flex flex-col">
                      <span className="font-bold">Rocket</span>
                      <span>rocket@gmail.com</span>
                    </div>
                    <div className="p-2">
                      <Link href={paths.dashboard.profile}>Profile</Link>
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

        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
