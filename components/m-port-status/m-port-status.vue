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
	height: 36rpx;
	line-height: 36rpx;
	font-size: 12px;
	border-radius: 36rpx;
	&.success {
		background-color: #07c160;
	}
	&.use {
		background-color: #ff3141;
	}
	&.forbid {
		background-color: #666666;
	}
}
</style>
