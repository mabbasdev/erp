export default function DashboardPage() {
    return (
        <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            <h1 className="text-[19px] font-semibold leading-tight tracking-tight text-foreground sm:text-[23px] lg:text-[24px]">
                Dashboard
            </h1>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                Select a module from the sidebar to get started.
            </p>
        </section>
    );
}
