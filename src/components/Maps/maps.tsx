// File: pages/maps.jsx
import React from "react";

const Map = () => {
  return (
    <div className="py-10 container mx-auto px-6">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800 md:my-10">
        Joe Media
      </h2>

      {/* Container for Map and Info */}
      <div className="flex flex-col md:flex-row justify-center gap-10">
        {/* Map Section */}
        <div className="w-full md:w-1/2 rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0867337398885!2d106.83721437499444!3d-6.251586793733553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69edb2cdd9e7db%3A0x83666a218a1c4a35!2sGraha%20Permata%20Pancoran!5e0!3m2!1sen!2sid!4v1730271002001!5m2!1sen!2sid"
            width="600"
            height="450"
            style={{ border: 0 }}
          
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-96"
          ></iframe>
        </div>
        

        {/* Information Section */}
        <div className="flex flex-col justify-center md:w-1/2">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Lokasi Kantor
          </h1>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Graha Permata Pancoran, Ruko Jl. KH. Guru Amin No. Kav. 32 Blok
            A10-D10, RT.2/RW.4, Pancoran, Kec. Pancoran, Kota Jakarta Selatan,
            Daerah Khusus Ibukota Jakarta 12780
          </p>

          {/* Contact Info */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Kontak Kami
            </h3>
            <p className="text-gray-600">Email: klikjoemedia@gmail.com</p>
            <p className="text-gray-600">Instagram: @klik.joemedia</p>
          </div>

          {/* Operating Hours */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Jam Operasional
            </h3>
            <p className="text-gray-600">Senin - Jumat: 09:00 - 17:00</p>
            <p className="text-gray-600">Sabtu: 09:00 - 13:00</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Deskripsi</h3>
            <p className="text-gray-600 leading-relaxed">
              Joe Media adalah media digital yang mengusung nilai{" "}
              <strong>Jujur, Objektif, dan Edukatif</strong>. Kami hadir di
              tengah era disrupsi untuk menyebarkan informasi yang menenangkan
              hati dan meningkatkan wawasan masyarakat Indonesia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
