import React from 'react'
import {useRouter} from 'next/router'
import {getRubricColor} from '../utils/colorRubric'

const BottomBackButton: React.FC = () => {
	const router = useRouter()
	const [isVisible, setIsVisible] = React.useState(false)
	const [isPressed, setIsPressed] = React.useState(false)
	const [isTransitioning, setIsTransitioning] = React.useState(false)

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true)
		}, 100)
		return () => clearTimeout(timer)
	}, [])

	const handleClick = async () => {
		if (isTransitioning) return
		setIsTransitioning(true)
		setIsPressed(true)
		await new Promise((resolve) => setTimeout(resolve, 100))
		setIsPressed(false)
		await new Promise((resolve) => setTimeout(resolve, 100))
		setIsVisible(false)
		await new Promise((resolve) => setTimeout(resolve, 400))
		await router.push('/')
	}

	const backButtonColors = getRubricColor('back')
	const backButtonStyle = `page-button ${backButtonColors.primary} ${
		isPressed ? 'button-pressed' : 'button-default'
	} ${isVisible ? 'translate-y-0' : 'translate-y-below'} back-btn`

	return (
		<div className='back-btn-outer'>
			<div
				className={`${backButtonStyle} back-btn-transition`}
				onClick={() => {
					void handleClick()
				}}
			>
				<div className='pointer-events-none w-[80%] text-center'>Back</div>
			</div>
		</div>
	)
}

export default BottomBackButton
