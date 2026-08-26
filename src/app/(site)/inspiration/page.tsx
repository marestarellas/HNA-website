import type { Metadata } from "next";
import { Plate, Quote, Trail } from "@/components/inspiration/Plate";

export const metadata: Metadata = {
	title: "Inspiration · Attuning to Nature",
	description:
		"The reading, images and half-thoughts the project grew out of: poetry, sea-writing, colonial organisms, and the rhythm of surf.",
};

export default function InspirationPage() {
	return (
		<article className="mx-auto w-full max-w-4xl px-6 py-16">
			{/* ------------------------------------------------------------- opening */}
			<p className="font-sans text-xs uppercase tracking-[0.22em] text-muted">
				Notebook
			</p>
			<h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">Inspiration</h1>

			<div className="mt-10 max-w-2xl border-y border-rule py-8 text-center">
				<p className="font-serif text-2xl italic leading-snug text-foreground md:text-3xl">
					Sea is History.
				</p>
				<p className="mt-2 font-sans text-[10px] uppercase tracking-[0.22em] text-muted">
					Derek Walcott
				</p>
				<p className="mt-7 font-serif text-2xl italic leading-snug text-foreground md:text-3xl">
					The unity is sub-marine.
				</p>
				<p className="mt-2 font-sans text-[10px] uppercase tracking-[0.22em] text-muted">
					Edward Kamau Brathwaite
				</p>
			</div>

			<p className="mt-8 max-w-2xl font-serif text-lg leading-relaxed text-foreground/85">
				This page is not an argument. It is the pile of things the project grew out
				of: pages photographed in books, poems that would not leave, an encyclopaedia
				entry read at eleven at night, water filmed because it was doing something
				that seemed to matter. Some of it became method. Most of it stayed
				atmosphere, which is its own kind of use.
			</p>

			{/* ------------------------------------------------------------- trails */}
			<div className="mt-20">
				<Trail
					n={1}
					title="The sea as a place things came from"
					lead="Before it was a stimulus or a signal, the sea was the thing everything else emerged out of. That is not a metaphor the project invented; it is one it inherited."
				>
					<div className="grid gap-6 sm:grid-cols-3">
						<Plate src="/inspiration/image13.jpg" alt="From the moodboard: sea imagery." index={0} />
						<Plate src="/inspiration/image12.jpg" alt="From the moodboard: sea imagery." index={1} />
						<Plate src="/inspiration/image11.jpg" alt="From the moodboard: sea imagery." index={2} />
					</div>
				</Trail>

				<Trail
					n={2}
					title="I was reading a scientific article"
					lead="Atwood gets to the project's problem before the project does. A brain photographed, full of branches; a seascape with corals and shining tentacles; the same shapes turning up on both sides of the skull. The poem does not argue that the resemblance means anything. It just refuses to let go of it."
				>
					<div className="grid items-start gap-6 sm:grid-cols-2">
						<Plate
							src="/inspiration/image1.jpg"
							alt="A photographed book page: Margaret Atwood's poem, I Was Reading a Scientific Article."
							note="Margaret Atwood, I Was Reading a Scientific Article"
							index={3}
						/>
						<Plate src="/inspiration/image10.jpg" alt="From the moodboard." index={4} />
					</div>
					<Quote attribution="Margaret Atwood">
						I touch you, I am created in you somewhere as a complex filament of light.
					</Quote>
				</Trail>

				<Trail
					n={3}
					title="Siphonophores, or how many things become one thing"
					lead="A siphonophore looks like an animal and is a colony. Its parts are separate organisms, specialised past the point of being able to live alone, cooperating closely enough that calling the result one creature or many is a matter of where you stand. It is the clearest picture anyone has offered of what coupling might mean when it goes all the way down."
				>
					<div className="grid items-start gap-6 sm:grid-cols-3">
						<Plate
							src="/inspiration/image14.jpg"
							alt="A phone screenshot of the Wikipedia entry on Siphonophorae, describing them as colonial organisms of specialised zooids."
							note="Read at 23:14, which is when this kind of thing gets read"
							index={5}
						/>
						<Plate src="/inspiration/image4.jpg" alt="From the moodboard." index={6} />
						<Plate src="/inspiration/image2.jpg" alt="From the moodboard." index={7} />
					</div>
				</Trail>

				<Trail
					n={4}
					title="The essence of rhythm"
					lead="Susanne Langer, on why breaking surf is the grandest expression of rhythm most people ever meet. Her point is precise and it is the one the whole method rests on: rhythm is not periodicity. A thing is rhythmic when the ending of one event prepares the next."
				>
					<Quote attribution="Susanne Langer, Feeling and Form, 1953" large>
						The essence of rhythm is the preparation of a new event by the ending of a
						previous one.
					</Quote>
					<p className="max-w-2xl font-serif text-lg leading-relaxed text-foreground/85">
						In a surf field each comber rolling in is shaped by the undertow flowing
						back, and hurries the recession of the previous wave by suction. There is no
						dividing line between the two events, and a breaking wave is still as
						definite an event as one could wish to find. Breathing works the same way:
						exhaling and inhaling prepare one another. Nothing here is a metronome, and
						everything here is rhythmic.
					</p>
					<Quote attribution="Karl Joël, quoted in Jung, 1962">
						Outside and inside are one. The whole symphony of sensations fades away into
						one tone, all senses become one sense, which is one with feeling; the world
						expires in the soul and the soul dissolves in the world.
					</Quote>
					<div className="mt-10 grid gap-6 sm:grid-cols-2">
						<Plate src="/inspiration/image9.jpg" alt="From the moodboard." index={8} />
						<Plate src="/inspiration/image7.jpg" alt="From the moodboard." index={9} />
					</div>
				</Trail>

				<Trail
					n={5}
					title="Beauty, with the faint bitterness of eternity"
					lead="Max Rieser, writing in 1955, on where our ideas about beauty come from. Thomas Mann's philosopher, the one who first suspected that time might be an illusion, is walking by the sea when it occurs to him. Both are making the same claim: that the categories we think with were shaped by looking at this."
				>
					<div className="grid items-start gap-6 sm:grid-cols-2">
						<Plate
							src="/inspiration/image6.jpg"
							alt="A photographed page discussing the contemplation of nature and the origins of ideas about beauty."
							note="Max Rieser, Three Stages of the Contemplation of Nature, Journal of Philosophy 52:7, 1955"
							index={0}
						/>
						<div>
							<Quote attribution="Thomas Mann, 1969">
								Walking by the sea, with the faint bitterness of eternity upon his lips.
							</Quote>
							<p className="font-serif text-lg leading-relaxed text-foreground/85">
								All our ideas about beauty have their root in the contemplation of
								nature, Rieser writes, and in the evolution of the thought generated by
								that contemplation through the ages. If that is right then a project
								measuring how a body tunes to a place is not studying an unusual
								experience. It is studying the ordinary one that everything else was
								built on top of.
							</p>
						</div>
					</div>
				</Trail>

				<Trail
					n={6}
					title="Keep on sailing"
					lead="Less rigorous and kept anyway, because a moodboard that only holds citable things is a bibliography."
				>
					<div className="grid items-start gap-6 sm:grid-cols-2">
						<div>
							<Quote attribution="Sarah Kay" large>
								Because there is nothing more beautiful than the way the ocean refuses to
								stop kissing the shoreline, no matter how many times it is sent away.
							</Quote>
							<p className="font-serif text-lg leading-relaxed text-foreground/85">
								Our lives move at the rhythm of the moon. Each tide in reveals new
								possibilities and each tide out casts water spells of healing. The ocean
								teaches patience, openness, change and freedom, and the sea, as Riordan
								has it, does not like to be restrained. Eyes on the horizon, heart open.
							</p>
						</div>
						<Plate src="/inspiration/image5.jpg" alt="From the moodboard." index={1} />
					</div>
					<div className="mt-10">
						<Plate src="/inspiration/image8.jpg" alt="From the moodboard." index={2} wide />
					</div>
				</Trail>

				<Trail
					n={7}
					title="A very female sea"
					lead="For two and a half billion years everything alive floated in the same womb-like ocean, nourished by its chemistry and rocked by lunar tides. Darwin thought the menstrual cycle started there, echoing the moon-pulse of the sea. Life did not gestate inside any creature; it gestated inside the ocean that contained all of it."
				>
					<div className="rounded-sm border border-dashed border-rule p-6">
						<p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
							Image to be added
						</p>
						<p className="mt-2 max-w-xl font-serif text-[15px] leading-relaxed text-foreground/80">
							The screenshot for this trail, the one pairing the passage with footage of
							water on rock, is not in the repository yet. Drop the file into{" "}
							<code className="text-foreground">public/inspiration/</code> and it can be
							placed here.
						</p>
					</div>
				</Trail>

				<Trail
					n={8}
					title="Loose sheets"
					lead="Kept without a thread yet."
				>
					<div className="grid gap-6 sm:grid-cols-2">
						<Plate src="/inspiration/image3.jpg" alt="A photographed page: the Walcott and Brathwaite epigraphs." note="Where this page opens" index={3} />
					</div>
				</Trail>
			</div>

			<section className="mt-24 border-t border-rule pt-8">
				<p className="max-w-2xl font-sans text-xs leading-relaxed text-muted">
					Photographs of pages are reproduced here as they were collected, with the
					source named wherever it was known. Everything quoted belongs to its author.
					If this section goes public, the longer passages are worth a permissions
					check first; short quotations with attribution are a different matter from
					a full page reproduced as an image.
				</p>
			</section>
		</article>
	);
}
