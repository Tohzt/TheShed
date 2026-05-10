import * as React from 'react'

interface FoodScannerProps {
	onCapture: (imageData: string) => void
	onClose: () => void
}

export const FoodScanner: React.FC<FoodScannerProps> = ({ onCapture, onClose }) => {
	const videoRef = React.useRef<HTMLVideoElement | null>(null)
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
	const [hasCamera, setHasCamera] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const streamRef = React.useRef<MediaStream | null>(null)

	React.useEffect(() => {
		const initCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'environment' },
				})
				if (videoRef.current) {
					videoRef.current.srcObject = stream
					streamRef.current = stream
					setHasCamera(true)
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to access camera'
				)
			}
		}

		initCamera()

		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop())
			}
		}
	}, [])

	const handleCapture = () => {
		if (videoRef.current && canvasRef.current) {
			const context = canvasRef.current.getContext('2d')
			if (context) {
				canvasRef.current.width = videoRef.current.videoWidth
				canvasRef.current.height = videoRef.current.videoHeight
				context.drawImage(
					videoRef.current,
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height
				)
				const imageData = canvasRef.current.toDataURL('image/jpeg')
				onCapture(imageData)
			}
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div className='flex w-full max-w-md flex-col gap-4 rounded-lg bg-card p-4'>
				<h2 className='text-lg font-semibold text-foreground'>Scan Food</h2>

				{error ? (
					<div className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
						{error}
					</div>
				) : hasCamera ? (
					<>
						<video
							ref={videoRef}
							autoPlay
							playsInline
							className='aspect-video rounded-md bg-black'
						/>
						<canvas ref={canvasRef} className='hidden' />
						<div className='flex gap-2'>
							<button
								onClick={handleCapture}
								className='flex-1 rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
							>
								📸 Capture
							</button>
							<button
								onClick={onClose}
								className='flex-1 rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground hover:bg-accent'
							>
								Cancel
							</button>
						</div>
					</>
				) : (
					<p className='text-sm text-muted-foreground'>Initializing camera...</p>
				)}
			</div>
		</div>
	)
}
