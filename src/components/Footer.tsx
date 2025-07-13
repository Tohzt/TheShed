import React from 'react'
import GoBack from './goBack'
//import { useSession } from "next-auth/react"

interface FooterProps {
	goBack: boolean
	signIn: boolean
	signOut: boolean
}

const Footer = (props: FooterProps) => {
	//const { data: sessionData } = useSession();

	return (
		<div>
			{/*
      {props.signIn && !sessionData &&
        <div className="abs-br w-[6em] h-[6em] overflow-hidden flex -center bg-secondary-dark rounded-tl-2xl border-l-4 border-t-2 border-white">
          <SignIn />
        </div>
      }
      {props.signOut && sessionData &&
        <div className="abs-br w-[6em] h-[6em] overflow-hidden flex -center bg-secondary-dark rounded-tl-2xl border-l-4 border-t-2 border-white">
          <SignOut />
        </div>
      }
      */}
			{props.goBack && (
				<div className='abs-bl -center flex h-[6em] w-[6em] overflow-hidden rounded-tr-2xl border-r-4 border-t-2 border-white bg-secondary-dark'>
					<GoBack />
				</div>
			)}
		</div>
	)
}
export default Footer
