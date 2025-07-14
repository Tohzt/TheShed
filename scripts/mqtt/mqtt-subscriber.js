const mqtt = require('mqtt')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const mqttHost = '6784f057241d43e792716144445e08a3.s1.eu.hivemq.cloud'
const mqttPort = 8883
const mqttUser = 'TooMuch2Do'
const mqttPass = 'sgfHMQ8520!'
const mqttTopic = 'shed/sensors/temperature'

const client = mqtt.connect(`mqtts://${mqttHost}:${mqttPort}`, {
	username: mqttUser,
	password: mqttPass,
	rejectUnauthorized: false, // For demo only; use proper certs in production!
})

client.on('connect', () => {
	console.log('Connected to MQTT broker')
	client.subscribe(mqttTopic, (err) => {
		if (!err) {
			console.log(`Subscribed to topic: ${mqttTopic}`)
		}
	})
})

client.on('message', async (topic, message) => {
	try {
		const data = JSON.parse(message.toString())
		console.log('Received:', data)

		// Write to your database
		// Find or create device
		let device = await prisma.device.findUnique({
			where: {name: data.deviceName},
		})
		if (!device) {
			device = await prisma.device.create({
				data: {
					name: data.deviceName,
					type: data.deviceType,
					location: data.location,
					description: `Auto-registered ${data.deviceType} device in ${data.location}`,
				},
			})
		}

		// Create reading
		await prisma.devicereading.create({
			data: {
				device: {connect: {id: device.id}},
				temperature: data.temperature ?? null,
				humidity: data.humidity ?? null,
				pressure: data.pressure ?? null,
				motion: data.motion ?? null,
				light: data.light ?? null,
				metadata: null,
			},
		})

		console.log('Saved to database!')
	} catch (err) {
		console.error('Error processing message:', err)
	}
})
