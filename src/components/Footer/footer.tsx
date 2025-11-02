// import { Link } from "lucide-react";
// import Image from "next/image";

// const footer = () => {
//   return (
//     <footer className="footer bg-base-300 p-10 text-base-content sm:footer-horizontal md:px-80">
//       <div>
//         <Link className="" href="/">
//           <Image
//             width={200}
//             height={100}
//             src={"/images/logo/logomedia.png"}
//             alt="Logo"
//             priority
//           />
//         </Link>
//         <p>
//           JoeMedia
//           <br />
//           Jujur • Objektif • Edukatif (JOE)
//         </p>
//       </div>
//       <nav>
//         <h6 className="footer-title">Services</h6>
//         <a className="link link-hover">Branding</a>
//         <a className="link link-hover">Design</a>
//         <a className="link link-hover">Marketing</a>
//         <a className="link link-hover">Advertisement</a>
//       </nav>
//       <nav>
//         <h6 className="footer-title">Company</h6>
//         <a className="link link-hover">About us</a>
//         <a className="link link-hover">Contact</a>
//         <a className="link link-hover">Jobs</a>
//         <a className="link link-hover">Press kit</a>
//       </nav>
//       <nav>
//         <h6 className="footer-title">Legal</h6>
//         <a className="link link-hover">Terms of use</a>
//         <a className="link link-hover">Privacy policy</a>
//         <a className="link link-hover">Cookie policy</a>
//       </nav>
//     </footer>
//   );
// };

// export default footer;


"use client";

import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-base-300 text-base-content px-6 py-10 md:px-40">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
              <div>
        <Link href="/" className="inline-block mb-3" >
          <Image
            width={50}
            height={10}
            src={"/images/logo/logomedia.png"}
            alt="Logo"
            priority
          />
        </Link>
        <p>
          JoeMedia
          <br />
          Jujur • Objektif • Edukatif (JOE)
        </p>
      </div>

        {/* Lokasi Kantor */}
        <div>
          <h6 className="footer-title text-lg font-semibold mb-2">
            Lokasi Kantor
          </h6>
          <p className="text-sm text-gray-700 leading-relaxed">
            Graha Permata Pancoran, Ruko Jl. KH. Guru Amin No. Kav. 32 Blok
            A10-D10, RT.2/RW.4, Pancoran, Kec. Pancoran, Kota Jakarta Selatan,
            DKI Jakarta 12780
          </p>
        </div>

        {/* Kontak Kami */}
        <div>
          <h6 className="footer-title text-lg font-semibold mb-2">
            Kontak Kami
          </h6>
          <p className="text-sm text-gray-700">
            <strong>Email:</strong>{" "}
            <a
              href="mailto:klikjoemedia@gmail.com"
              className="link link-hover text-blue-600"
            >
              klikjoemedia@gmail.com
            </a>
          </p>
          <p className="text-sm text-gray-700">
            <strong>Instagram:</strong>{" "}
            <a
              href="https://www.instagram.com/klik.joemedia"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover text-blue-600"
            >
              @klik.joemedia
            </a>
          </p>
        </div>

        {/* Jam Operasional */}
        <div>
          <h6 className="footer-title text-lg font-semibold mb-2">
            Jam Operasional
          </h6>
          <p className="text-sm text-gray-700">
            <strong>Senin - Jumat:</strong> 09:00 - 17:00
          </p>
          <p className="text-sm text-gray-700">
            <strong>Sabtu:</strong> 09:00 - 13:00
          </p>
          <p className="text-sm text-gray-700 mt-4">
            <em>Tutup pada hari Minggu & hari libur nasional.</em>
          </p>
        </div>
      </div>

      {/* Footer bawah */}
      <div className="border-t border-gray-400 mt-10 pt-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Joe Media — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
