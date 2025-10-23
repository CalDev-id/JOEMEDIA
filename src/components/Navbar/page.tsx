"use client";

import Link from "next/link";
import { useState, FC } from "react";
import Image from "next/image";
import RunningText from "@/components/RunningText/page";

interface NavbarProps {
  active?: "home" | "dbcc" | "national" | string;
}

const Navbar: FC<NavbarProps> = ({ active }) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <div>
    <div className="navbar bg-[#141414] shadow-sm px-20">
      <div className="flex-1">
        <Link className="bg-white" href="/">
          <Image
            width={200}
            height={100}
            src={"/images/logo/logo2.png"}
            alt="Logo"
            priority
            className=""
          />
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 text-slate-100 font-medium">
          <li>
            <a>NEWS</a>
          </li>
          <li>
            <a>WATCH</a>
          </li>
          <li>
            <a>LISTEN</a>
          </li>
          
          <li>
            <details>
              <summary>Parent</summary>
              <ul className="rounded-t-none bg-base-100 p-2">
                <li>
                  <a>Link 1</a>
                </li>
                <li>
                  <a>Link 2</a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
          <RunningText
        text="Stay ahead with the latest news updates from around the world. Your trusted source for breaking news, in-depth analysis, and exclusive stories."
        speed={25}
      />
    </div>
  );
};

export default Navbar;
