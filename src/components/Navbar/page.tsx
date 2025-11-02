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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (!session) setProfile(null);
      else fetchProfile();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Pantau scroll posisi untuk menambahkan efek sticky dan shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  return (
    <div className="relative">
      {/* Navbar Mobile */}
      <div
        className={`navbar fixed top-0 left-0 w-full z-[9999] text-white transition-all duration-300 sm:hidden ${
          isScrolled ? "bg-black/95 shadow-lg backdrop-blur" : "bg-[#000000]"
        }`}
      >
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <ul className="menu dropdown-content menu-sm z-[9999] mt-3 w-52 rounded-box bg-slate-600 p-2 shadow">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/allNews">News</Link>
              </li>
              <li>
                <Link href="/aboutUs">Nasional</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Internasional</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Politik</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Ekonomi</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Hiburan & Lifestyle</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Olahraga</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Teknologi & Otomotif</Link>
              </li>
              <li>
                <Link href="/aboutUs">About us</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <Link href="/">
            <Image width={200} height={100} src="/images/logo/logo3.png" alt="Logo" priority />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Navbar Desktop */}
      <div
        className={`navbar fixed top-0 left-0 w-full hidden sm:flex px-20 transition-all duration-300 z-[9999] ${
          isScrolled ? "bg-black/95 shadow-lg backdrop-blur" : "bg-[#000000]"
        }`}
      >
        <div className="navbar-start">
          <Link href="/">
            <Image width={200} height={100} src="/images/logo/logo3.png" alt="Logo" priority />
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
                <Link href="/aboutUs">Nasional</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Internasional</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Politik</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Ekonomi</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Hiburan & Lifestyle</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Olahraga</Link>
              </li>
                            <li>
                <Link href="/aboutUs">Teknologi & Otomotif</Link>
              </li>
              <li>
                <Link href="/aboutUs">About us</Link>
              </li>

          </ul>
        </div>

        <div className="navbar-end relative">
          <Link href="/allNews">
            <button className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </Link>

          {/* Dropdown Profile */}
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="ml-3">
                <Image
                  width={40}
                  height={40}
                  src={profile?.avatar_url || "/images/logo/user.png"}
                  alt="User Avatar"
                  className="rounded-full border-2 border-slate-400 hover:border-white transition-all duration-300"
                />
              </button>

              {isDropdownOpen && (
                <ul
                  className="absolute right-0 mt-3 w-40 rounded-lg bg-slate-700 shadow-lg p-2 z-[9999]"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <li className="hover:bg-slate-600 rounded-md">
                    <Link href="/profile" className="block px-3 py-2 text-sm text-white">
                      Profile
                    </Link>
                  </li>
                  <li className="hover:bg-slate-600 rounded-md">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm text-white"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-sm bg-white font-semibold text-black ml-4">
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* Running Text di bawah Navbar */}
      {active === "home" && (
        <div className="mt-[120px] m-5 mb-0">
          <RunningText
            text="Stay ahead with the latest news updates from around the world. Your trusted source for breaking news, in-depth analysis, and exclusive stories."
            speed={25}
          />
        </div>
      )}
    </div>
  );
};

export default Navbar;
