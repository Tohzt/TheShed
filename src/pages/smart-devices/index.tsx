import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import Footer from '../../components/Footer'
import BottomBackButton from '../../components/BottomBackButton'

interface DeviceReading {
	id: string
	temperature?: number
	humidity?: number
	pressure?: number
	motion?: boolean
	light?: number
	createdAt: string
}

interface Device {
	id: string
	name: string
	type: string
	location: string
	description?: string
	isActive: boolean
	readings: DeviceReading[]
}

const SmartDevices = () => {
	const [devices, setDevices] = useState<Device[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		void fetchDevices()
		// Set up polling for real-time updates
		const interval = setInterval(() => {
			void fetchDevices()
		}, 30000)
		return () => clearInterval(interval)
	}, [])

	const fetchDevices = async () => {
		try {
			const response = await fetch('/api/devices')
			if (response.ok) {
				const data = (await response.json()) as Device[]
				setDevices(data)
			} else {
				setError('Failed to fetch devices')
			}
		} catch (err) {
			setError('Network error')
		} finally {
			setLoading(false)
		}
	}

	const formatTemperature = (temp: number | null | undefined) => {
		if (temp === null || temp === undefined) return 'N/A'
		return `${temp.toFixed(1)}°F`
	}

	const formatHumidity = (humidity: number | null | undefined) => {
		if (humidity === null || humidity === undefined) return 'N/A'
		return `${humidity.toFixed(1)}%`
	}

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString()
	}

	const getDeviceIcon = (type: string) => {
		switch (type.toLowerCase()) {
			case 'esp32-dht11':
				return '🌡️'
			case 'esp32-motion':
				return '👁️'
			case 'raspberry-pi':
				return '🍓'
			default:
				return '📱'
		}
	}

	const getStatusColor = (isActive: boolean) => {
		return isActive ? 'text-green-500' : 'text-red-500'
	}

	return (
		<>
			<Head>
				<title>Smart Devices - The Shed</title>
				<meta
					name='description'
					content='Smart device monitoring and control'
				/>
				<link rel='icon' href='/tohzt.ico' />
			</Head>

			<main className='min-h-screen overflow-x-hidden bg-background pl-8 pr-8'>
				<div className='smart-devices-page'>
					<div className='sd-p-container mt-[120px]'>
						<div className='sd-p-content'>
							<h4 className='mb-6 text-2xl font-bold text-foreground'>
								Smart Devices
							</h4>

							{loading && (
								<div className='text-center text-foreground'>
									<div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-foreground'></div>
									<p>Loading devices...</p>
								</div>
							)}

							{error && (
								<div className='mb-4 rounded bg-destructive p-4 text-destructive-foreground'>
									Error: {error}
								</div>
							)}

							{!loading && !error && devices.length === 0 && (
								<div className='p-8 text-center text-foreground'>
									<p className='mb-4 text-xl'>No devices found</p>
									<p className='text-muted-foreground'>
										Your ESP32 devices will appear here once they start sending
										data.
									</p>
								</div>
							)}

							{!loading && !error && devices.length > 0 && (
								<div className='flex flex-col gap-4'>
									{/*<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>*/}
									{devices.map((device) => {
										const latestReading = device.readings[0]
										return (
											<div
												key={device.id}
												className='rounded-lg border border-border bg-card p-6 backdrop-blur-sm'
											>
												<div className='mb-4 flex items-center justify-between'>
													<div className='flex items-center space-x-3'>
														<span className='text-2xl'>
															{getDeviceIcon(device.type)}
														</span>
														<div>
															<h5 className='text-lg font-semibold text-card-foreground'>
																{device.name}
															</h5>
															<p className='text-sm text-muted-foreground'>
																{device.location}
															</p>
														</div>
													</div>
													<div
														className={`text-sm ${getStatusColor(
															device.isActive
														)}`}
													>
														{device.isActive ? '● Active' : '○ Inactive'}
													</div>
												</div>

												{latestReading ? (
													<div className='space-y-3'>
														<div className='grid grid-cols-2 gap-4'>
															{latestReading.temperature !== null && (
																<div className='text-center'>
																	<div className='text-2xl font-bold text-card-foreground'>
																		{formatTemperature(
																			latestReading.temperature
																		)}
																	</div>
																	<div className='text-xs text-muted-foreground'>
																		Temperature
																	</div>
																</div>
															)}
															{latestReading.humidity !== null && (
																<div className='text-center'>
																	<div className='text-2xl font-bold text-card-foreground'>
																		{formatHumidity(latestReading.humidity)}
																	</div>
																	<div className='text-xs text-muted-foreground'>
																		Humidity
																	</div>
																</div>
															)}
														</div>
														<div className='text-center text-xs text-muted-foreground'>
															Last updated:{' '}
															{formatTime(latestReading.createdAt)}
														</div>
													</div>
												) : (
													<div className='py-4 text-center text-muted-foreground'>
														No recent readings
													</div>
												)}

												<div className='mt-4 border-t border-border pt-4'>
													<div className='text-xs text-muted-foreground'>
														<div>Type: {device.type}</div>
														{device.description && (
															<div>Description: {device.description}</div>
														)}
													</div>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</div>
					</div>
					<div className='flex-1' />
					<BottomBackButton />
				</div>

				<Footer goBack={false} signIn={false} signOut={false} />
			</main>
		</>
	)
}

export default SmartDevices
