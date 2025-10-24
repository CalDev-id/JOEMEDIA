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
      const { data: { user } } = await supabase.auth.getUser();
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

  // Fungsi logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

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
                <Link href="/login" className="btn btn-sm bg-white text-black font-semibold">
                  Log In
                </Link>
              </li>
            )}
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
