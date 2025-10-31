"use client";

import Link from "next/link";
import { useState, FC, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import RunningText from "@/components/RunningText/page";

interface NavbarProps {
  active?: "home" | "dbcc" | "national" | string;
}

interface UserProfile {
  full_name: string;
  role: string;
  avatar_url?: string;
}

const Navbar: FC<NavbarProps> = ({ active }) => {
  const [isHover, setIsHover] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Ambil profil user dari Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role, avatar_url")
          .eq("id", user.id)
          .single();
        if (!error && data) setProfile(data);
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchProfile();

    // Dengarkan perubahan sesi (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
        if (!session) setProfile(null);
        else fetchProfile();
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fungsi logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  return (
    <div className="bg-transparent">
      <div className="navbar bg-[#000000] text-white shadow-sm sm:hidden">
        <div className="navbar-start">
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />{" "}
              </svg>
            </div>
            <ul className="menu dropdown-content menu-sm z-1 mt-3 w-52 rounded-box bg-slate-600 p-2 shadow ">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/allNews">News</Link>
            </li>
            <li>
              <Link href="/aboutUs">About Us</Link>
            </li>
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <Link className="" href="/">
            <Image
              width={200}
              height={100}
              src={"/images/logo/logo2.png"}
              alt="Logo"
              priority
            />
          </Link>
        </div>
        <div className="navbar-end">
            <Link href="/allNews">
          <button className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />{" "}
            </svg>
          </button>
          </Link>
        </div>
      </div>

      {/* navbar dekstop */}

      <div className="navbar hidden bg-[#000000] px-20 shadow-sm sm:flex">
        <div className="navbar-start">
          <Link className="" href="/">
            <Image
              width={200}
              height={100}
              src={"/images/logo/logo2.png"}
              alt="Logo"
              priority
            />
          </Link>
        </div>

        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1 font-medium text-slate-100">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/allNews">News</Link>
            </li>

            <li>
              <Link href="/aboutUs">About Us</Link>
            </li>

            {/* Tampilkan dropdown jika login, atau tombol login jika belum */}
            {isLoggedIn ? (
              <li className="z-9999">
                <details>
                  <summary>{profile?.full_name || "User"}</summary>
                  <ul className="rounded-t-none bg-slate-600 p-2">
                    <li>
                      <Link href="/profile">Profile</Link>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </details>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="btn btn-sm bg-white font-semibold text-black"
                >
                  Log In
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="navbar-end">
            <Link href="/allNews">

            
          <button className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />{" "}
            </svg>
          </button>
          </Link>
        </div>
      </div>
        {active === "home" &&       <div className=" m-5 mb-0">
        <RunningText
          text="Stay ahead with the latest news updates from around the world. Your trusted source for breaking news, in-depth analysis, and exclusive stories."
          speed={25}
        />
      </div>}
    </div>
  );
};

export default Navbar;
