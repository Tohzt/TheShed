import * as React from 'react'
//import { useSession } from "next-auth/react";
import Footer from '../../components/Footer'
import Link from 'next/link'
import {getRubricColor} from '../../utils/colorRubric'

const ArcadePage = () => {
	//const { data: session } = useSession();
	const backgroundClass = getRubricColor('arcade').background

	return (
		true && (
			<>
				<main className={`overflow-x-hidden ${backgroundClass}`}>
					<div className='screen -center flex-col border-4 border-zinc-400'>
						<span className='text-2xl text-white'>Working</span>
						<div className='-center flex gap-8'>
							<div className='-center -column flex h-[20vw] max-h-[120px] w-[20vw] max-w-[120px] rounded-2xl border-4 border-white bg-secondary'>
								<Link
									className='-center flex h-full w-full'
									href='/arcade/huebound'
								>
									HueBound
								</Link>
							</div>
						</div>

						<br />
						<span className='text-2xl text-white'>Probably Not Working</span>
						<div className='-center flex gap-8'>
							<div className='-center -column flex h-[20vw] max-h-[120px] w-[20vw] max-w-[120px] rounded-2xl border-4 border-white bg-secondary'>
								<Link
									className='-center flex h-full w-full'
									href='/arcade/chromaze'
								>
									Chromaze
								</Link>
							</div>

							<div className='-center -column flex h-[20vw] max-h-[120px] w-[20vw] max-w-[120px] rounded-2xl border-4 border-white bg-secondary'>
								<Link
									className='-center flex h-full w-full'
									href='/arcade/tetris'
								>
									TETRIS
								</Link>
							</div>

							<div className='-center -column flex h-[20vw] max-h-[120px] w-[20vw] max-w-[120px] rounded-2xl border-4 border-white bg-secondary'>
								<Link
									className='-center flex h-full w-full'
									href='/arcade/godot'
								>
									Godot
								</Link>
							</div>

							<div className='-center -column flex h-[20vw] max-h-[120px] w-[20vw] max-w-[120px] rounded-2xl border-4 border-white bg-secondary'>
								<Link
									className='-center flex h-full w-full'
									href='/arcade/mario'
								>
									Mario
								</Link>
							</div>
						</div>
					</div>
					<Footer goBack={true} signIn={false} signOut={false} />
				</main>
			</>
		)
	)
}

export default ArcadePage
