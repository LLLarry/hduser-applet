import request from '@/utils/request.js'

/**
 * 获取附近坐标点的设备列表
 */
export const getDevicesByPoint = (data) => {
	return request({
		url: '/nearby/getDevicesByPosition',
		data
	})
}

/**
 * 获取设备详细信息
 */
export const getEquipmentDate = (data) => {
	return request({
		url: '/nearby/getEquipmentDate',
		data,
		method: 'post',
		header: {
			'content-type': 'application/json'
		}
	})
}