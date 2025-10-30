import Head from 'next/head'
import Image from 'next/image'
import Navbar from '@/components/Navbar/page'
import Footer from '@/components/Footer/footer'
import Map from '../components/maps'

export default function About() {
  return (
    <>
      <Head>
        <title>About — Joe Media</title>
        <meta name="description" content="Joe Media — Jujur, Objektif, Edukatif" />
      </Head>

      <main className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar active="about" />
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-extrabold">Tentang Joe Media</h1>
              <p className="mt-2 text-gray-600">Jujur • Objektif • Edukatif (JOE)</p>
            </header>

            <div className="grid gap-8 md:grid-cols-2 items-start">
              <div>
                <h2 className="text-xl font-semibold mb-3">Siapa kami</h2>
                <p className="leading-relaxed text-gray-700">Setiap media memiliki keunikan tentang perspektif berita dan kabar yang disebarkan ke masyarakat, Joe Media hadir sebagai media yang <strong>Jujur, Objektif, dan Edukatif</strong>, berdiri dari keresahan mulai banyaknya media yang kurang memiliki nilai-nilai kejujuran, objektivitas, dan tujuan mengedukasi. Kami Joe Media hadir dan lahir ditengah era disrupsi media.</p>

                <p className="mt-4 leading-relaxed text-gray-700">Tahun 2024 menjadi tonggak awal Kami berdiri dan mulai menyebarkan informasi dan berita yang menenangkan hati dan meningkatkan wawasan serta pengetahuan masyarakat.</p>

                <p className="mt-4 leading-relaxed text-gray-700">Berawal dari Bapak <strong>Joseph Hendarto</strong>, Founder Joe Media yang resah dengan situasi di tahun politik 2024, beliau mulai mendirikan media alternatif yang diisi oleh anak muda Gen Z. Lahirlah Joe Media pada <strong>5 Januari 2024</strong> di Ibukota Negara. Disinilah langkah Joe Media dimulai.</p>

                <p className="mt-4 leading-relaxed text-gray-700">Saat ini kami memiliki koresponden dan wartawan yang tersebar di kota-kota Indonesia Jakarta, Bandung, Solo, dan Surabaya. Untuk menyebarkan informasi yang Jujur, Objektif, dan Edukatif (JOE).</p>

              </div>

              <aside className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold">Visi</h3>
                  <p className="mt-2 text-gray-700 leading-relaxed">Menjadi media digital terpercaya yang menghadirkan informasi akurat, berimbang, dan inspiratif untuk membangun masyarakat yang kritis, cerdas, dan berdaya di era informasi global.</p>
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold">Misi</h3>
                  <ul className="mt-2 list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                    <li>Menyajikan informasi faktual dan ter verifikasi melalui proses jurnalistik yang profesional, transparan, dan beretika.</li>
                    <li>Mendorong literasi digital masyarakat agar lebih kritis dalam memilah dan memahami informasi di dunia maya.</li>
                    <li>Menjadi wadah aspirasi publik, terutama generasi muda, dalam menyuarakan gagasan, inovasi, dan perubahan sosial positif.</li>
                    <li>Mengembangkan jurnalisme data dan multimedia untuk menghadirkan berita yang menarik, mendalam, dan mudah diakses.</li>
                    <li>Membangun kolaborasi lintas komunitas dan institusi untuk memperkuat ekosistem media yang independen dan berkelanjutan.</li>
                    <li>Menegakkan prinsip keberimbangan dan keadilan sosial dalam setiap pemberitaan, tanpa tekanan politik, ekonomi, maupun kepentingan kelompok tertentu.</li>
                    <li>Mengutamakan keamanan dan integritas digital, baik dalam pengelolaan data, sumber informasi, maupun interaksi dengan audiens.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold">Koresponden & Jurnalis</h4>
                  <p className="mt-2 text-gray-700">Jakarta • Bandung • Solo • Surabaya</p>
                </div>

              </aside>
            </div>

            <section className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Struktur Organisasi</h3>

              <div className="rounded-lg overflow-hidden border">
                {/* Replace the src with /images/org-chart.jpg after adding the image to public/images */}
                <div className="relative w-full h-64 md:h-80">
                  <Image className='py-5' src="/images/logo/posisi.jpeg" alt="Struktur Organisasi Joe Media" fill style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </section>

            <footer className="mt-10 border-t pt-6 text-sm text-gray-600">
              <p className="mb-2">Didirikan: <strong>5 Januari 2024</strong></p>
              <p className="mb-2">Founder: <strong>Joseph Hendarto</strong></p>
              <p>Nilai: <strong>Jujur • Objektif • Edukatif (JOE)</strong></p>
            </footer>

          </div>
        </section>
            <Map />
              <Footer />
      </main>
    </>
  )
}
