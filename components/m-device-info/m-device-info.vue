<template>
	<cover-view class="m-device-info text-size-md bg-white rounded padding-2 d-flex align-items-center" v-if="coverView">
		<cover-view class="left flex-2 overflow-hidden">
			<cover-view class="d-flex align-items-center">
				<cover-view class="text-000">{{ info.deviceNum }}</cover-view>
				<cover-view class="margin-left-1 d-flex align-items-center" v-if="isOnline">
					<cover-view class="dot success"></cover-view>
					<cover-view class="text-success text-size-sm margin-left-1">在线</cover-view>
				</cover-view>
				<cover-view class="margin-left-1 d-flex align-items-center" v-else>
					<cover-view class="dot fail"></cover-view>
					<cover-view class="danger text-size-sm margin-left-1">离线</cover-view>
				</cover-view>
				<cover-view class="text-999 text-size-sm">{{info.device.hardversion}}（{{ deviceType === 0 ? '两轮电车桩' : '电动汽车桩' }}）</cover-view>
			</cover-view>
			<cover-view class="text-size-sm text-333 margin-top-1 margin-bottom-1" v-if="info.area">{{info.area.name}}</cover-view>
			
			<cover-view class="d-flex align-items-center">
				<m-port-status :coverView="coverView" type="success" :num="info.ports.free" class="margin-right-1" />
				<m-port-status :coverView="coverView" type="forbid" :num="info.ports.forbid" class="margin-right-1" />
				<m-port-status :coverView="coverView" type="use" :num="info.ports.use"  />
			</cover-view>
			
			<cover-view class="text-size-sm">
				<cover-view class="text-333 margin-top-1 margin-bottom-1">收费标准</cover-view>
				<cover-view class="text-999 overflow-hidden charge-info position-relative 9999" :style="{ height: chargeInfoHeight }">
					<cover-view class="charge-info-box">
						<cover-view class="charge-info-item"  v-for="(one, index) in chargeInfo" :key="index">{{one}}</cover-view>
					</cover-view>
					<!-- 切换图标 -->
					<cover-view class="position-absolute toggle" @click="toggle" :class="{'down': chargeInfoVisible}">
						<m-icon-image :coverView="coverView" name="arrow-right" size="34rpx"></m-icon-image>
					</cover-view>
					
				</cover-view>
			</cover-view>
		</cover-view>
		<cover-view class="right flex-1" @click="openLocation">
			<cover-view class="d-flex justify-content-center align-items-center margin-bottom-2 positon-icon-box">
				<m-icon-image :coverView="coverView" name="position" className="position-icon" size="72rpx"></m-icon-image>
			</cover-view>
			<cover-view class="text-size-md text-333 d-flex justify-content-center align-items-center">
				<cover-view class="d-flex justify-content-center align-items-center">
					<cover-view class="cover-view-primary">距离</cover-view>
					<cover-view class="cover-view-primary text-primary">{{ distance }}</cover-view>
					<cover-view class="cover-view-primary">Km</cover-view>
				</cover-view>
			</cover-view>
		</cover-view>
	</cover-view>
	
	<!-- view -->
	<view class="m-device-info text-size-md bg-white rounded padding-2 d-flex align-items-center" v-else>
		<view class="left flex-2 overflow-hidden">
			<view class="d-flex align-items-center">
				<view class="text-000">{{ info.deviceNum }}</view>
				<view class="margin-left-1 d-flex align-items-center" v-if="isOnline">
					<view class="dot success"></view>
					<view class="text-success text-size-sm margin-left-1">在线</view>
				</view>
				<view class="margin-left-1 d-flex align-items-center" v-else>
					<view class="dot fail"></view>
					<view class="text-danger text-size-sm margin-left-1">离线</view>
				</view>
				<view class="text-999 text-size-sm">（{{ deviceType === 0 ? '两轮电车桩' : '电动汽车桩' }}）</view>
			</view>
			<view class="text-size-sm text-333 margin-top-1 margin-bottom-1" v-if="info.area">{{ info.area.name }}</view>
			
			<view class="d-flex align-items-center">
				<m-port-status type="success" :num="info.ports.free" class="margin-right-1" />
				<m-port-status type="forbid" :num="info.ports.forbid" class="margin-right-1" />
				<m-port-status type="use" :num="info.ports.use"  />
			</view>
			
			<view class="text-size-sm">
				<view class="text-333 margin-top-1 margin-bottom-1">收费标准</view>
				<view class="text-999 overflow-hidden charge-info position-relative 9999" :style="{ maxHeight: chargeInfoHeight }">
					<view class="charge-info-box">
						<view class="charge-info-item" v-for="(one, index) in chargeInfo" :key="index">{{one}}</view>
					</view>
					<!-- 切换图标 -->
					<view class="position-absolute toggle" @click="toggle" :class="{'down': chargeInfoVisible}">
						<m-icon-image name="arrow-right" size="34rpx"></m-icon-image>
					</view>
					
				</view>
			</view>
		</view>
		<view class="right flex-1" @click="openLocation">
			<view class="d-flex justify-content-center align-items-center margin-bottom-2 positon-icon-box">
				<m-icon-image name="position" className="position-icon" size="72rpx"></m-icon-image>
			</view>
			<view class="text-size-md text-333 d-flex justify-content-center align-items-center">
				<view class="d-flex justify-content-center align-items-center">
					<view class="view-primary">距离</view>
					<view class="view-primary text-primary">{{ distance }}</view>
					<view class="view-primary">Km</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getElementInfo } from '@/uitls/index.js'
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
				const isCar = ['07', '12'].includes(this.info.device.hardversion)
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
							name: this.info.deviceNum,
							address: '中国河南郑州管城回族区',
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
					this.$nextTick(() =>{
						getElementInfo(this, '.charge-info-box').then(data => {
							if (data) {
								this.chargeInfoOriginHeight = data.height
							}
						})
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.m-device-info {
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
	}

</style>