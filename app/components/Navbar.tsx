import Image from "next/image";

export const Navbar = () => {
    return <nav className="flex justify-between items-center py-4">
        <div className="flex items-center gap-4">
            <Image src="/images/logo.png" alt="logo" width={48} height={48} />
            <span className="tracking-tighter text-3xl font-extrabold text-primary">
                Batua
            </span>
        </div>
    </nav>
}