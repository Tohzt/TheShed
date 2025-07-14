import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import Footer from '../../components/Footer'
import BottomBackButton from '../../components/BottomBackButton'
import {getRubricColor} from '../../utils/colorRubric'

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
	const backgroundClass = getRubricColor('smart-devices').background
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

			<main className={`overflow-x-hidden ${backgroundClass}`}>
				<div className='smart-devices-page border-4 border-blue-500'>
					<div className='sd-p-container mt-[150px] border-4 border-green-500'>
						<div className='sd-p-content'>
							<h4 className='mb-6 text-2xl font-bold text-white'>
								Smart Devices
							</h4>

							{loading && (
								<div className='text-center text-white'>
									<div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-white'></div>
									<p>Loading devices...</p>
								</div>
							)}

							{error && (
								<div className='mb-4 rounded bg-red-500 p-4 text-white'>
									Error: {error}
								</div>
							)}

							{!loading && !error && devices.length === 0 && (
								<div className='p-8 text-center text-white'>
									<p className='mb-4 text-xl'>No devices found</p>
									<p className='text-gray-300'>
										Your ESP32 devices will appear here once they start sending
										data.
									</p>
								</div>
							)}

							{!loading && !error && devices.length > 0 && (
								<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
									{devices.map((device) => {
										const latestReading = device.readings[0]
										return (
											<div
												key={device.id}
												className='rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm'
											>
												<div className='mb-4 flex items-center justify-between'>
													<div className='flex items-center space-x-3'>
														<span className='text-2xl'>
															{getDeviceIcon(device.type)}
														</span>
														<div>
															<h5 className='text-lg font-semibold text-white'>
																{device.name}
															</h5>
															<p className='text-sm text-gray-300'>
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
																	<div className='text-2xl font-bold text-white'>
																		{formatTemperature(
																			latestReading.temperature
																		)}
																	</div>
																	<div className='text-xs text-gray-300'>
																		Temperature
																	</div>
																</div>
															)}
															{latestReading.humidity !== null && (
																<div className='text-center'>
																	<div className='text-2xl font-bold text-white'>
																		{formatHumidity(latestReading.humidity)}
																	</div>
																	<div className='text-xs text-gray-300'>
																		Humidity
																	</div>
																</div>
															)}
														</div>
														<div className='text-center text-xs text-gray-400'>
															Last updated:{' '}
															{formatTime(latestReading.createdAt)}
														</div>
													</div>
												) : (
													<div className='py-4 text-center text-gray-400'>
														No recent readings
													</div>
												)}

												<div className='mt-4 border-t border-white/20 pt-4'>
													<div className='text-xs text-gray-300'>
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

							<div className='mt-8 rounded-lg border border-blue-500/30 bg-blue-500/20 p-4'>
								<h5 className='mb-2 text-lg font-semibold text-white'>
									ESP32 Integration Guide
								</h5>
								<div className='space-y-2 text-sm text-gray-300'>
									<p>
										• Your ESP32 should send data to:{' '}
										<code className='rounded bg-black/30 px-2 py-1'>
											POST /api/sensors/esp32
										</code>
									</p>
									<p>• Required fields: deviceName, deviceType, location</p>
									<p>
										• Optional fields: temperature, humidity, pressure, motion,
										light
									</p>
									<p>• Data format: JSON</p>
								</div>
							</div>
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
