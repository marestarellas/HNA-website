import { FAMILY_TOKEN } from "@/components/demos/_families";

/**
 * A drawn mark per topic. Each one draws the idea rather than symbolising it:
 * the attunement mark really is two rhythms settling into a fixed offset, the
 * oscillations mark really is a wave field with the column a timestack samples,
 * the phenomenology mark is a set of felt scales, and the connectedness mark is
 * the overlapping-circles device the field actually uses to ask how much of
 * yourself you place inside the natural world.
 *
 * Drawn at 56px, stroke-only, inheriting the card's accent so the mark and the
 * card's rule agree without either being told about the other.
 */

const S = 56;

function Frame({ children }: { children: React.ReactNode }) {
	return (
		<svg width={S} height={S} viewBox="0 0 56 56" fill="none" aria-hidden>
			{children}
		</svg>
	);
}

/** Two rhythms locking: same period, fixed offset. */
export function AttunementMark() {
	return (
		<Frame>
			<path
				d="M4 20c4-11 8-11 12 0s8 11 12 0 8-11 12 0 8 11 12 0"
				stroke={`var(${FAMILY_TOKEN.linear})`}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
			<path
				d="M4 38c4-11 8-11 12 0s8 11 12 0 8-11 12 0 8 11 12 0"
				stroke={`var(${FAMILY_TOKEN.oscillatory})`}
				strokeWidth="1.6"
				strokeLinecap="round"
				transform="translate(6 0)"
			/>
			{/* the constant gap that makes it locking rather than coincidence */}
			<path d="M22 20v18" stroke="currentColor" className="text-muted" strokeWidth="1" strokeDasharray="2 2.5" />
			<path d="M46 20v18" stroke="currentColor" className="text-muted" strokeWidth="1" strokeDasharray="2 2.5" />
		</Frame>
	);
}

/** A wave field, with the single column a timestack reads down. */
export function OscillationsMark() {
	return (
		<Frame>
			{[10, 18, 26, 34, 42].map((y, i) => (
				<path
					key={y}
					d={`M4 ${y}c5-${5 + i}, 11-${5 + i}, 16 0s11 ${5 + i} 16 0 11-${5 + i} 16 0`}
					stroke={`var(${FAMILY_TOKEN.complexity})`}
					strokeWidth="1.4"
					strokeLinecap="round"
					opacity={0.35 + i * 0.14}
				/>
			))}
			<rect
				x="33"
				y="5"
				width="5"
				height="46"
				stroke={`var(${FAMILY_TOKEN.information})`}
				strokeWidth="1.4"
				rx="1"
			/>
		</Frame>
	);
}

/** Felt scales: several dimensions, each reported somewhere along its range. */
export function PhenomenologyMark() {
	const rows = [
		{ y: 12, v: 0.72 },
		{ y: 22, v: 0.36 },
		{ y: 32, v: 0.86 },
		{ y: 42, v: 0.54 },
	];
	return (
		<Frame>
			{rows.map((r) => (
				<g key={r.y}>
					<path
						d={`M6 ${r.y}h44`}
						stroke="currentColor"
						className="text-rule"
						strokeWidth="1.4"
						strokeLinecap="round"
					/>
					<circle
						cx={6 + 44 * r.v}
						cy={r.y}
						r="3.2"
						fill={`var(${FAMILY_TOKEN.information})`}
					/>
				</g>
			))}
		</Frame>
	);
}

/** Inclusion of self in nature: two circles, overlapping by a chosen amount. */
export function ConnectednessMark() {
	return (
		<Frame>
			<circle
				cx="22"
				cy="28"
				r="14"
				stroke={`var(${FAMILY_TOKEN.oscillatory})`}
				strokeWidth="1.6"
			/>
			<circle
				cx="34"
				cy="28"
				r="14"
				stroke={`var(${FAMILY_TOKEN.complexity})`}
				strokeWidth="1.6"
			/>
			<path
				d="M28 15.4a14 14 0 0 0 0 25.2 14 14 0 0 0 0-25.2Z"
				fill="currentColor"
				className="text-foreground"
				opacity="0.1"
			/>
		</Frame>
	);
}
