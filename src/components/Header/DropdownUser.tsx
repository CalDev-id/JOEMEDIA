'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ClickOutside from "@/components/ClickOutside";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) console.error("Error fetching profile:", error.message);
        else setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    else router.push("/login");
  };

  // ✅ Gunakan avatar user dari Supabase Storage
  const avatarSrc =
    profile?.avatar_url && profile.avatar_url.trim() !== ""
      ? profile.avatar_url
      : "/images/logo/user.png"; // fallback image

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
      >
        {/* Nama dan Role */}
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {profile?.full_name || "User"}
          </span>
          <span className="block text-xs">{profile?.role || "Role"}</span>
        </span>

        {/* ✅ Avatar dinamis */}
        <span className="h-12 w-12 rounded-full overflow-hidden">
          <Image
            src={avatarSrc}
            alt="User avatar"
            width={48}
            height={48}
            className="object-cover rounded-full"
          />
        </span>

        {/* Panah dropdown */}
        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                My Profile
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
