import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ==========================================
   🔹 GET /api/users
   Ambil daftar user dari auth + profiles
========================================== */
export async function GET() {
  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authError) throw authError;

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role");
    if (profileError) throw profileError;

    const users = authData.users.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: profile?.full_name || "-",
          role: profile?.role || "-",
        },
      };
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ==========================================
   🔹 POST /api/users
   Buat user baru (auth + profiles)
========================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, role } = body;

    if (!email || !password)
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );

    // 1️⃣ Buat user di Supabase Auth
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (createError) throw createError;

    const userId = userData.user?.id;

    // 2️⃣ Simpan profil ke tabel profiles
    if (userId) {
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          full_name,
          role: role || "user",
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ==========================================
   🔹 PUT /api/users
   Update nama / role / password
========================================== */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, full_name, email, password, role } = body;

    if (!id)
      return NextResponse.json(
        { error: "ID user tidak ditemukan." },
        { status: 400 }
      );

    // 1️⃣ Update profil di tabel profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name,
        role,
      })
      .eq("id", id);

    if (profileError) throw profileError;

    // 2️⃣ Update password/email bila diberikan
    if (password || email) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          ...(email ? { email } : {}),
          ...(password ? { password } : {}),
        }
      );
      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ==========================================
   🔹 DELETE /api/users?id={id}
   Hapus user dari auth & tabel profiles
========================================== */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Parameter id wajib diisi." },
        { status: 400 }
      );

    // 1️⃣ Hapus dari tabel profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) throw profileError;

    // 2️⃣ Hapus dari Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
