<template>
	<cover-view class="m-port-status padding-x-2 text-white" :class="classText" v-if="coverView">
		{{ text }}
	</cover-view>
	<view class="m-port-status padding-x-2 text-white" :class="classText" v-else>
		{{ text }}
	</view>
</template>

<script>
	export default {
		name: "m-port-status",
		props: {
			type: {
				type: String,
				default: 'success', // 'success' | 'use' |'forbid'
			},
			num:{
				type: [Number, String],
				default: ''
			},
			className: {
				type: String,
				default: ''
			},
			coverView: {
				type: Boolean,
				default: false
			}
			
		},
		methods: {
			
		},
		computed: {
			text () {
				const v = this.type === 'use' ? '占用' : this.type === 'forbid' ? '故障' : '空闲'
				return `${v}(${this.num})`
			},
			classText () {
				return `${this.type} ${this.className}`
			}
		}
	}
</script>

<style lang="scss" scoped>
.m-port-status {
	height: 50rpx;
	line-height: 50rpx;
	font-size: 12px;
	border-radius: 50rpx;
	&.success {
		background-color: #ccf1d5;
		color: #07c160;
	}
	&.use {
		background-color: #efe1de;
		color: #e60012;
	}
	&.forbid {
		background-color: #f1eedf;
		color: #fe9230;
	}
}
</style>
