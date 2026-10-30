import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <h1 className="font-bold text-2xl">Бет табылмады</h1>
      <p className="text-mute mt-2">Мекенжай қате немесе бет жойылған.</p>
      <Link href="/profile" className="btn btn-p mt-5">Кабинетке қайту</Link>
    </div>
  );
}
