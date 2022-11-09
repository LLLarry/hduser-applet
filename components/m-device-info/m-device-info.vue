<template>	
	<cover-view class="m-device-info" v-if="coverView">
		<cover-view class="m-device-info-box bg-white text-size-md padding-4 d-flex overflow-hidden" >
			<cover-view class="left flex-2 overflow-hidden">
				<cover-view class="d-flex align-items-center margin-bottom-1">
					<cover-view class="text-000 text-truncate title">{{ deviceName }}</cover-view>
				</cover-view>
				
				<cover-view class="d-flex align-items-center  margin-bottom-1">
					<cover-view class="margin-left-1 d-flex align-items-center" v-if="isOnline">
						<cover-view class="dot success"></cover-view>
						<cover-view class="text-success text-size-sm margin-left-1">在线</cover-view>
					</cover-view>
					<cover-view class="margin-left-1 d-flex align-items-center" v-else>
						<cover-view class="dot fail"></cover-view>
						<cover-view class="text-danger text-size-sm margin-left-1">离线</cover-view>
					</cover-view>
					<cover-view class="text-999 text-size-sm margin-left-1">{{ deviceType === 0 ? '两轮电车桩' : '电动汽车桩' }}</cover-view>
				</cover-view>
				<cover-view class="text-size-sm text-333 margin-top-1 margin-bottom-1" v-if="info.area">{{areaName}}</cover-view>
				
				<cover-view class="d-flex align-items-center">
					<m-port-status :coverView="coverView" type="success" :num="info.ports.free" class="margin-right-1" />
					<m-port-status :coverView="coverView" type="forbid" :num="info.ports.forbid" class="margin-right-1" />
					<m-port-status :coverView="coverView" type="use" :num="info.ports.use"  />
				</cover-view>
				
			</cover-view>
			<cover-view class="right flex-1 position-relative" @click="openLocation">
				<cover-view class="d-flex align-items-center position-absolute distance-box">
					<cover-view class="d-flex justify-content-center align-items-center positon-icon-box margin-right-1">
						<m-icon-image :coverView="coverView" name="posi" className="position-icon" size="40rpx"></m-icon-image>
					</cover-view>
					<cover-view class="text-size-sm text-333 d-flex justify-content-center align-items-center">
						<cover-view class="d-flex justify-content-center align-items-center distance-text flex-nowrap">
							<cover-view class="view-primary text-white text-nowrap">距离</cover-view>
							<cover-view class="view-primary text-white text-nowrap">{{ distance }}</cover-view>
							<cover-view class="view-primary text-white text-nowrap">Km</cover-view>
						</cover-view>
					</cover-view>
				</cover-view>
			</cover-view>
		</cover-view>
	</cover-view>
	
	<view class="m-device-info" v-else>
		<view class="m-device-info-box bg-white text-size-md padding-4 d-flex overflow-hidden" >
			<view class="left flex-2 overflow-hidden">
				<view class="d-flex align-items-center margin-bottom-1">
					<view class="text-000 text-truncate title">{{ deviceName }}</view>
				</view>
				
				<view class="d-flex align-items-center  margin-bottom-1">
					<view class="margin-left-1 d-flex align-items-center" v-if="isOnline">
						<view class="dot success"></view>
						<view class="text-success text-size-sm margin-left-1">在线</view>
					</view>
					<view class="margin-left-1 d-flex align-items-center" v-else>
						<view class="dot fail"></view>
						<view class="text-danger text-size-sm margin-left-1">离线</view>
					</view>
					<view class="text-999 text-size-sm margin-left-1">{{ deviceType === 0 ? '两轮电车桩' : '电动汽车桩' }}</view>
				</view>
				<view class="text-size-sm text-333 margin-top-1 margin-bottom-1" v-if="info.area">{{areaName}}</view>
				
				<view class="d-flex align-items-center">
					<m-port-status type="success" :num="info.ports.free" class="margin-right-1" />
					<m-port-status type="forbid" :num="info.ports.forbid" class="margin-right-1" />
					<m-port-status type="use" :num="info.ports.use"  />
				</view>
				
			</view>
			<view class="right flex-1 position-relative" @click="openLocation">
				<view class="d-flex align-items-center position-absolute distance-box">
					<view class="d-flex justify-content-center align-items-center positon-icon-box margin-right-1">
						<m-icon-image name="posi" className="position-icon" size="40rpx"></m-icon-image>
					</view>
					<view class="text-size-sm text-333 d-flex justify-content-center align-items-center">
						<view class="d-flex justify-content-center align-items-center distance-text flex-nowrap">
							<view class="view-primary text-white text-nowrap">距离</view>
							<view class="view-primary text-white text-nowrap">{{ distance }}</view>
							<view class="view-primary text-white text-nowrap">Km</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getElementInfo } from '@/utils/index.js'
	export default {
		name:"m-device-info",
		props: {
			coverView: {
				type: Boolean,
				default: false
			},
			info: {
				type: Object,
				default: () =>({})
			}
		},
		data() {
			return {
				chargeInfoVisible: false,
				chargeInfoOriginHeight: 0 ,
				chargeInfoHeight: '17px'
			};
		},
		computed: {
			// 设备状态 true 在线 false 离线
			isOnline () {
				if (this.info.device && this.info.device.state) {
					if (this.info.device.state == 1) {
						return true
					}
				}
				return false
			},
			// 设备类型 0 两轮电瓶车 1电动汽车
			deviceType () {
				const isCar = ['07', '12'].includes(this.info.device.hardVersion)
				return isCar ? 1 :0
			},
			// 收费标准
			chargeInfo () {
				let ci = this.info.chargeInfo
				if (typeof ci !== 'string') {
					ci = ''
				}
				if (ci.length <= 0) {
					return ['暂无收费说明']
				}
				return ci.split(/[\n\r]/)
			},
			// 距离 km
			distance () {
				return this.info.distance.toFixed(2)
			},
			// 名称设备
			deviceName () {
				return this.info.deviceName ? this.info.deviceName : this.info.deviceNum
			},
			// 名称设备
			areaName () {
				return (this.info.area && this.info.area.name) ? this.info.area.name : ''
			}
		},
		methods: {
			toggle () {
				this.chargeInfoVisible = !this.chargeInfoVisible
				if (this.chargeInfoVisible) {
					// this.chargeInfoHeight = this.chargeInfoOriginHeight + 'px'
					this.chargeInfoHeight = 'initial'
				} else {
					this.chargeInfoHeight = '17px'
				}
			},
			// 点击唤起内置地图查看位置
			openLocation () {
				console.log('组件内 openLocation')
				uni.getLocation({
					type: 'gcj02', //返回可以用于uni.openLocation的经纬度
					success:  (res) => {
						const latitude = this.info.geoCoord[1]
						const longitude = this.info.geoCoord[0]
						uni.openLocation({
							latitude: latitude,
							longitude: longitude,
							scale: 8,
							name: this.info.deviceName || this.info.deviceNum,
							address: (this.info.area && this.info.area.name) || '',
							success: function () {
								console.log('success');
							},
							fail: function (res) {
								console.log('fail', res);
							}
						});
					}
				})
			},
			
		},
		watch: {
			info: {
				handler (v) {
					console.log(v)
					// this.$nextTick(() =>{
					// 	getElementInfo(this, '.charge-info-box').then(data => {
					// 		if (data) {
					// 			this.chargeInfoOriginHeight = data.height
					// 		}
					// 	})
					// })
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.m-device-info {
		box-shadow: 6rpx 6rpx 10rpx #eee, -6rpx -6rpx 10rpx #eee;
		border-radius: 16rpx;
		.m-device-info-box {
			border-radius: 16rpx;
			overflow: hidden;
		}
		.title {
			font-size: 28rpx;
			font-weight: bold;
		}
		.dot {
			width: 16rpx;
			height: 16rpx;
			border-radius: 16rpx;
			&.success {
				background-color: #28a745;
			}
			&.fail {
				background-color: #dc3545;
			}
		}
		.charge-info {
			height: 34rpx;
			// transition: all .3s ease-in-out;
			.charge-info-item {
				height: 34rpx;
				line-height: 34rpx;
				white-space: nowrap;
				overflow: hidden;
				width: 100%;
			}
			
			.toggle {
				right: -1rpx;
				top: 0;
				background-color: #ffffff;
				// transition: all .3s ease-in-out;
				transform-origin: center;
				&.down {
					transform: rotate(90deg);
				}
			}
		}
		::v-deep .position-icon {
			font-size: 68rpx;
		}
		.right {
			// border-color: #ccc !important;
			.distance-box {
				padding: 18rpx 20rpx;
				top: -40rpx;
				right: -40rpx;
				background-color: #5dbe72;
				color: #fff;
				border-radius: 0 0 0 36rpx;
			}
		}
	}

</style>