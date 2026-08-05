export function SiteFooter() {
	return (
		<footer className="mt-24 border-t border-rule">
			<div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 font-sans text-xs uppercase tracking-widest text-muted">
				<span>bootstrap · {new Date().getFullYear()}</span>
				<span>attuningtonature.earth</span>
			</div>
		</footer>
	);
}
