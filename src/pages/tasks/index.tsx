import * as React from 'react'
//import { useSession } from "next-auth/react";
import Footer from '../../components/Footer'
import {getRubricColor} from '../../utils/colorRubric'
import {useRouter} from 'next/router'
import BottomBackButton from '../../components/BottomBackButton'

const Tasks = () => {
	//const { data: session } = useSession();
	const backgroundClass = getRubricColor('tasks').background
	const router = useRouter()

	// State for back button animation
	const [isBackButtonVisible, setIsBackButtonVisible] = React.useState(false)
	const [isBackButtonPressed, setIsBackButtonPressed] = React.useState(false)
	const [isTransitioning, setIsTransitioning] = React.useState(false)

	// Initialize back button animation on mount
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setIsBackButtonVisible(true)
		}, 100)
		return () => clearTimeout(timer)
	}, [])

	const handleBackButtonClick = async () => {
		if (isTransitioning) return

		setIsTransitioning(true)
		setIsBackButtonPressed(true)

		// Wait for button press effect
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Release button
		setIsBackButtonPressed(false)

		// Wait for button to return to default
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Animate button sliding out
		setIsBackButtonVisible(false)

		// Wait for slide out animation
		await new Promise((resolve) => setTimeout(resolve, 400))

		// Navigate back
		await router.push('/')
	}

	const backButtonColors = getRubricColor('back')
	const backButtonStyle = `page-button ${backButtonColors.primary} ${
		isBackButtonPressed ? 'button-pressed' : 'button-default'
	} ${isBackButtonVisible ? 'translate-y-0' : 'translate-y-full'}`

	return (
		true && (
			<>
				<main className={`overflow-x-hidden ${backgroundClass}`}>
					<div className='tasks-page border-4 border-red-500'>
						<div className='t-p-container mt-[150px] border-4 border-green-500'>
							<div className='t-p-content'>
								<h4>Tasks</h4>
								<div className='task-container'>
									<div className='task-item-container'>
										<span> Input </span>
										<button className='btn-add-task'> [Add Task] </button>
									</div>
								</div>
							</div>
						</div>
						<div className='flex-1' />
						{/* Back Button */}
						<BottomBackButton />
					</div>

					<Footer goBack={false} signIn={false} signOut={false} />
				</main>
			</>
		)
	)
}

export default Tasks
