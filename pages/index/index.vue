<template>
	<view class="page-body d-flex flex-column position-relative">
		<view class="d-flex align-items-center w-100 bg-white header">
			<view class="flex-1">
				<m-subsection :list="tabList" :currentIndex="current" @change="sectionChange"></m-subsection>
			</view>
			<view class="padding-x-2">
				<view class="d-flex align-items-center" v-if="mode === 'list'" @click="toggleMode('map')">
					<text class="iconfont icon-ditu text-666 margin-right-1 text-primary"></text>
					<text class="text-666 text-size-md text-primary" >地图</text>
				</view>
				<view class="d-flex align-items-center" v-else @click="toggleMode('list')">
					<text class="iconfont icon-liebiao text-666 margin-right-1 text-primary"></text>
					<text class="text-666 text-size-md text-primary" >列表</text>
				</view>
			</view>
		</view>
		
		
		
		<view class="map-section page-section page-section-gap flex-1 position-relative overflow-hidden" v-show="mode === 'map'">
			<map
				id="map"
				style="width: 100%; height:100%;"
				:longitude="longitude"
				:latitude="latitude"
				:scale="scale"
				:show-location="true"
				:enable-rotate="true"
				@markertap="markertap"
				@tap="tap"
				@updated="updated"
				@regionchange="regionchange"
			>
				  <!-- <cover-view class="cover-view" @click="controltap">
					<cover-image class="station" src="https://linli-oss.vecommunity.com/xchx/icon/position.jpg"></cover-image>
				  </cover-view> -->
			</map>
			<!-- 空间 -->
			<view class="contral-position" @click="controltap">
				<image src="https://linli-oss.vecommunity.com/xchx/icon/position.jpg" mode=""></image>
			</view>
			
			<m-device-info :coverView="coverView" v-if="selectDevice" :info="selectDevice" />
		</view>
		<view class="list-section page-section page-section-gap flex-1 position-relative overflow-hidden" v-if="mode === 'list'">
			<m-device-list :list="list"/>
		</view>
	</view>
</template>

<script>
	import { getDevicesByPoint, getEquipmentDate } from '@/api/home/index.js'
	const baseSize = 30
	export default {
		data() {
			return {
				tabList: [
					{
						name: '两轮电瓶车',
						width: 0,
						left: 0,
					},
					{
						name: '电动汽车',
						width: 0,
						left: 0
					}
				],
				current: 0, // 当前设备类型 0 两轮电动车 1 电动汽车
				markers: [], // 地图标点数据
				list: [], // 获取到的设备信息
				
				scale: 16, // 缩放级别
				longitude: 116.397228240966, // 目前人处于的位置
				latitude: 39.90960456049752,
				mapLongitude: 116.397228240966, // 地图中心所处位置
				mapLatitude: 39.90960456049752,
				mpCtx: null, // 地图实例
				selectDevice: null, // 选择的设备信息
				mode: 'map', // 当前模式 map / list
				isNowSelectDevice: false, // 是否正在选中Device事件，选中后200ms关闭
			}
		},
		onLoad () {           
			// this.getDeviceList(this.longitude, this.latitude)
		},
		mounted () {
			this.mpCtx = uni.createMapContext('map', this)
			// this.mpCtx.initMarkerCluster({
			// 	enableDefaultStyle: true,
			// 	zoomOnClick: true,
			// 	gridSize: 50
			// })
			uni.getLocation({
				type: 'wgs84',
				success: (res) => {
					this.longitude = res.longitude
					this.latitude = res.latitude
					// console.log('当前位置的经度：' + res.longitude);
					// console.log('当前位置的纬度：' + res.latitude);
					this.mpCtx.moveToLocation()
				},
				fail (res) {
					// console.log('fail', res)
				}
			});
		},
		watch: {
			// 监听地图markers的改变，阿静覆盖物重新渲染
			markers: {
				handler (v) {
					this.setMarkers()
				}
			},
			current: {
				handler () {
					this.getDeviceList(
						this.mapLongitude,
						this.mapLatitude,
						this.longitude,
						this.latitude,
						this.current
					)
					this.selectDevice = null
				}
			}
		},
		methods: {
			/** 获取设备信息通过经纬度
			 * @param {Object} longitude 搜索设备的经度
			 * @param {Object} latitude 搜索设备的纬度
			 * @param {Object} cLongitude 人的经度 （目的是计算当前位置与设备位置之间的距离）
			 * @param {Object} cLatitude 人的纬度 （目的是计算当前位置与设备位置之间的距离）
			 */
			async getDeviceList (longitude, latitude, cLongitude, cLatitude, type) {
				const { code, message, result } = await getDevicesByPoint({
					longitude,
					latitude,
					cLongitude,
					cLatitude,
					type,
					range: type === 0 ? 50 : 5000
				})
				if (code === 200) {
					this.list = result
					this.markers = this.fmtData(result)
				} else {
					uni.showToast({
						title: message
					})
				}
			},
			// 获取设备详细信息
			async getDeviceDetail (data) {
				const { code, message, result } = await getEquipmentDate(data)
				if (code === 200) {
					return result
				} else {
					uni.showToast({
						title: message
					})
					return Promise.reject(message)
				}
			},
			sectionChange (index) {
				this.current = index
			},
			// 格式化小区的数据
			fmtData (json) {
				return json.map(one => {
					const { device = {} } = one
					const {geoCoord: [longitude, latitude], code} = device
					if (this.selectDevice && Number(this.selectDevice.deviceNum) === Number(code)) {
						return {
							latitude,
							longitude,
							iconPath: this.getIconPath(true),
							id: Number(code),
							width: (baseSize + 6) + 'px',
							height: baseSize + 6 + 'px',
							joinCluster: false // 参与点聚合
						}
					}
					return {
						latitude,
						longitude,
						iconPath: this.getIconPath(false),
						id: Number(code),
						width: baseSize + 'px',
						height: baseSize + 'px',
						joinCluster: false // 参与点聚合
					}
				})
			},
			// 更新marks
			setMarkers () {
				// 新的markers给添加上去
				this.mpCtx.addMarkers({
					markers: this.markers,
					clear: true // 先清空地图上的点
				})
			},
			// 点击地图标点
			async markertap ({ markerId }) {
				this.isNowSelectDevice = true
				// 获取设备的详细信息
				const result = await this.getDeviceDetail([markerId.toString().padStart(6, '0')])
				setTimeout(() => {
					this.isNowSelectDevice = false
				}, 200)
				// 筛选出符合条件的设备
				const findItem = this.list.find(item => Number.parseInt(item.device.code) === markerId)
				this.selectDevice = findItem ? {
					...findItem.device,
					...result[0]
				} : null
				// 选中的marker点放大，其他的marker点缩小
				this.selectMarkerFun(markerId)
			},
			
			// 选中的marker点放大，其他的marker点缩小
			selectMarkerFun (markerId) {
				// 点击的标点放大，其他的标点缩小
				this.markers = this.markers.map(marker => {
					
					if (markerId === marker.id) {
						marker.width = (baseSize + 6) + 'px'
						marker.height = (baseSize + 6) + 'px'
						marker.iconPath = this.getIconPath(true)
					} else {
						marker.width = baseSize + 'px'
						marker.height = baseSize + 'px'
						marker.iconPath =  this.getIconPath(false)
					}
					return marker
				})
			},
			// 点击非标点区域
			tap ({ detail }) {
				// 刚点击标点时禁止关闭
				if (this.isNowSelectDevice) return false
				// 选择的设备清空
				this.selectDevice = null
				/**
				 * latitude: 34.694883979754955
				 * longitude: 113.6627661146589
				 */
				// 标点按钮恢复正常大小
				this.markers = this.markers.map(marker => {
					marker.width = baseSize + 'px'
					marker.height = baseSize + 'px'
					marker.iconPath = '/static/images/marker.png'
					return marker
				})
			},
			// 右下角图标绑定的事件：点击右下角图标触发
			controltap(e) {
			  // 创建 map 上下文 MapContext 对象。建议使用 wx.createSelectorQuery 获取 context 对象
			  // 获取地图，map要与wxml页面的id名一致。注意：不需要#符号
			 
			  
			  // 将地图中心移置当前定位点，此时需设置地图组件 show-location 为true。'2.8.0' 起支持将地图中心移动到指定位置。
			  this.mpCtx.moveToLocation()
			 
			  // 将地图缩放值改为初始值
			  this.scale = 16
			},
			updated (detail) {
				// console.log('updated', detail)
			},
			// 显示范围改变
			regionchange ({detail}) {
				if (detail.centerLocation) {
					this.mapLongitude = detail.centerLocation.longitude // 地图中心所处位置
					this.mapLatitude = detail.centerLocation.latitude
					this.getDeviceList(
						this.mapLongitude,
						this.mapLatitude,
						this.longitude,
						this.latitude,
						this.current,
					)
				}
				
			},
			// 唤起内置地图查看位置
			openLocation () {
				const selectMarker = this.markers.find(marker => marker.id === this.selectDevice)
				if (!selectMarker) return false
				uni.getLocation({
					type: 'gcj02', //返回可以用于uni.openLocation的经纬度
					success:  (res) => {
						const latitude = selectMarker.latitude;
						const longitude = selectMarker.longitude;
						uni.openLocation({
							latitude: latitude,
							longitude: longitude,
							scale: 16,
							name: this.selectDevice,
							address: '中国河南郑州管城回族区',
							success: function () {
								// console.log('success');
							},
							fail: function (res) {
								// console.log('fail', res);
							}
						});
					}
				});
			},
			toggleMode (mode) {
				this.mode = mode
			},
			// 获取图片路径
			getIconPath (isActive) {
				if (this.current === 0) { // 两轮电车桩
					if (isActive) { // 选中
						return '/static/images/marker_active.png'
					} else { // 未选中
						return '/static/images/marker.png'
					}
				} else { // 汽车桩
					if (isActive) { // 选中
						return '/static/images/marker_car_active.png'
					} else { // 未选中
						return '/static/images/marker_car.png'
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		
		.page-body {
			width: 100vw;
			height: 100vh;
			background-color: #f5f7fa;
			.header {
				height: 80rpx;
			}
			
			.contral-position {
				position: absolute;
				right: 20rpx;
				top: 100rpx;
				width: 60rpx;
				height: 60rpx;
				image {
					width: 100%;
					height: 100%;
					border-radius: 60rpx;
					overflow: hidden;
				}
			}
			.map-section ::v-deep .m-device-info{
				position: absolute;
				left: 15rpx;
				right:15rpx;
				bottom: 100rpx;
				z-index: 99;
			}
			.list-section ::v-deep {
				.m-device-list {
					height: 100%;
					margin-bottom: 24rpx;
				}
				.m-device-info {
					margin-bottom: 24rpx;
				}
			}
		}
		
	}
</style>
