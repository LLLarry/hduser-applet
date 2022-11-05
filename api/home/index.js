import request from '@/uitls/request.js'

export const getDevicesByPoint = (data) => {
	return request({
		url: '/equipment/getDevicesByPosition',
		data
	})
}